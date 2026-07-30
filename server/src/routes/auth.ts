// ──────────────────────────────────────────────
// Auth Routes — Registration, Login, Token Verification
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { auth, collectionRef, docRef, serverTimestamp } from '../config/firebase';
import { firebaseService, buildSuccessResponse } from '../services/firebase.service';
import { createAuditLog } from '../utils/audit';
import { slugify } from '../utils/helpers';
import type { AuthenticatedRequest } from '../types';

const router = Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

// ── Schemas ──
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(200),
  role: z.enum(['ceo', 'finance_manager', 'dept_manager', 'employee']).default('employee'),
  departmentName: z.string().optional(),
});

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * POST /auth/register
 * Register a new user and company. Creates:
 * - Firebase Auth user
 * - Company document in Firestore
 * - User document in Firestore
 * - Department document if departmentName provided
 */
router.post('/register', validate(registerSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, displayName, companyName, role, departmentName } = req.body;

    // Check if Firebase Auth is configured
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      res.status(500).json({
        success: false,
        error: 'Configuration Error',
        message: 'Firebase Auth is not configured. Please set FIREBASE_PRIVATE_KEY in environment.',
      });
      return;
    }

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth().createUser({
        email,
        password,
        displayName,
      });
    } catch (authError: unknown) {
      const message = authError instanceof Error ? authError.message : 'Failed to create user';
      if (message.includes('email already exists')) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'An account with this email already exists',
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: 'Registration Failed',
        message,
      });
      return;
    }

    const companySlug = slugify(companyName);

    try {
      // Create company document
      const companyRef = collectionRef('companies').doc();
      const companyData = {
        id: companyRef.id,
        name: companyName,
        slug: companySlug,
        size: 1,
        currency: 'USD',
        timezone: 'UTC',
        tier: 'free',
        status: 'active',
        settings: {
          requireManagerApproval: true,
          requireFinanceApproval: true,
          requireCeoApproval: false,
          autoApprovalLimit: 100,
          maxExpenseAmount: 10000,
          enableAi: true,
          enableOcr: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await companyRef.set(companyData);

      // Create department if specified
      let departmentId: string | undefined;
      if (departmentName) {
        const deptRef = collectionRef('departments').doc();
        const deptData = {
          id: deptRef.id,
          companyId: companyRef.id,
          name: departmentName,
          budget: 0,
          budgetSpent: 0,
          budgetRemaining: 0,
          headCount: 1,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await deptRef.set(deptData);
        departmentId = deptRef.id;
      }

      // Create user document
      const userRef = collectionRef('users').doc(userRecord.uid);
      const userData = {
        id: userRecord.uid,
        email,
        displayName,
        companyId: companyRef.id,
        role,
        departmentId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await userRef.set(userData);

      // Set custom claims
      await auth().setCustomUserClaims(userRecord.uid, {
        role,
        companyId: companyRef.id,
      });

      await createAuditLog({
        companyId: companyRef.id,
        userId: userRecord.uid,
        action: 'auth.registered',
        resource: 'users',
        resourceId: userRecord.uid,
        details: { companyName, role },
      });

      res.status(201).json(buildSuccessResponse({
        uid: userRecord.uid,
        email,
        displayName,
        role,
        companyId: companyRef.id,
        token: await auth().createCustomToken(userRecord.uid),
      }, 'Registration successful'));
    } catch (dbError) {
      // Rollback: delete the Firebase Auth user if Firestore operations fail
      await auth().deleteUser(userRecord.uid).catch(() => {});
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to complete registration',
    });
  }
});

/**
 * POST /auth/login
 * Login is handled by Firebase Client SDK.
 * This endpoint just verifies the resulting token and returns user data.
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Token is required. Login is handled by Firebase Client SDK; use the returned ID token here.',
      });
      return;
    }

    // Verify the token
    const decodedToken = await auth().verifyIdToken(token);

    // Fetch user profile
    const userDoc = await collectionRef('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User profile not found. Please register first.',
      });
      return;
    }

    const userData = userDoc.data()!;

    // Fetch company
    const companyDoc = await collectionRef('companies').doc(userData.companyId).get();

    res.json(buildSuccessResponse({
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || userData.displayName,
        photoURL: decodedToken.picture || userData.photoURL,
        role: userData.role,
        companyId: userData.companyId,
        departmentId: userData.departmentId,
        status: userData.status,
      },
      company: companyDoc.exists ? { id: companyDoc.id, ...companyDoc.data() } : null,
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication Failed',
      message: 'Invalid or expired token',
    });
  }
});

/**
 * POST /auth/verify
 * Verify a Firebase token and return user info
 */
router.post('/verify', validate(verifySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.body;

    const decodedToken = await auth().verifyIdToken(token);
    const userDoc = await collectionRef('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User profile not found',
      });
      return;
    }

    const userData = userDoc.data()!;

    res.json(buildSuccessResponse({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      displayName: decodedToken.name || userData.displayName,
      role: userData.role,
      companyId: userData.companyId,
      departmentId: userData.departmentId,
    }));
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'The provided token is invalid or expired',
    });
  }
});

export default router;
