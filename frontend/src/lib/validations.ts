import { z } from 'zod';

// Signup validation schema
export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    password2: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ['password2'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Organization validation schema
export const organizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Organization name can only contain letters, numbers, spaces, hyphens, and underscores'),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

// Namespace validation schema
export const namespaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Namespace name must be at least 2 characters')
    .max(255, 'Namespace name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Namespace name can only contain letters, numbers, and underscores'),
  organization: z.number().min(1, 'Organization is required'),
});

export type NamespaceFormData = z.infer<typeof namespaceSchema>;