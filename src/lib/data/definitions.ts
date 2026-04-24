// src/lib/data/definitions.ts

/**
 * Represents a user account in the system.
 */
export type User = {
  id: string; // Unique identifier (e.g., from Firebase Auth)
  name: string;
  email: string;
  avatarUrl?: string;
};

/**
 * Defines the available subscription plans for the Pilot Suite.
 */
export type SubscriptionPlan = {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number; // Price in cents
  userLimit: number;
  // A list of product keys that this plan grants access to.
  entitlements: ('PrintPilot' | 'StickerPilot' | 'TimePilot')[];
};

/**
 * Represents a customer's active subscription, linking a User to a Plan.
 */
export type Subscription = {
  id: string; // Unique subscription ID (e.g., from Stripe)
  userId: User['id'];
  planId: SubscriptionPlan['id'];
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  startDate: string; // ISO 8601 date string
  renewalDate: string; // ISO 8601 date string
};

/**
 * Represents the effective license and entitlements for a given user.
 * This is the object that would be checked to grant or deny access to features.
 */
export type License = {
  userId: User['id'];
  isActive: boolean; // Is the subscription currently active?
  planName: SubscriptionPlan['name'];
  entitlements: SubscriptionPlan['entitlements'];
  userLimit: number;
  currentUsers: number; // The number of users currently on the team
  renewalDate: string;
};

// --- MOCK DATA ---
// This data simulates what would be stored in a database like Firestore.

export const MOCK_USERS: User[] = [
  { id: 'user_1', name: 'Acme Inc.', email: 'ceo@acme.com' },
  { id: 'user_2', name: 'Stark Industries', email: 'tony@stark.com' },
];

export const MOCK_PLANS: SubscriptionPlan[] = [
    { id: 'starter', name: 'Starter', price: 4900, userLimit: 5, entitlements: ['TimePilot'] },
    { id: 'professional', name: 'Professional', price: 9900, userLimit: 20, entitlements: ['PrintPilot', 'StickerPilot', 'TimePilot'] },
    { id: 'enterprise', name: 'Enterprise', price: 49900, userLimit: 1000, entitlements: ['PrintPilot', 'StickerPilot', 'TimePilot'] },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    { id: 'sub_1', userId: 'user_1', planId: 'professional', status: 'active', startDate: '2024-01-15T00:00:00Z', renewalDate: '2025-01-15T00:00:00Z' },
    { id: 'sub_2', userId: 'user_2', planId: 'enterprise', status: 'trialing', startDate: '2024-06-20T00:00:00Z', renewalDate: '2024-07-20T00:00:00Z' },
];

/**
 * A mock function to simulate fetching a user's derived license.
 * In a real application, this would involve database lookups and business logic.
 */
export const getLicenseForUser = (userId: string): License | null => {
    const subscription = MOCK_SUBSCRIPTIONS.find(sub => sub.userId === userId);
    if (!subscription) return null;

    const plan = MOCK_PLANS.find(p => p.id === subscription.planId);
    if (!plan) return null;
    
    // In a real app, you would fetch the team members to get this count.
    const mockCurrentUsers = userId === 'user_1' ? 18 : 75;

    return {
        userId: userId,
        isActive: subscription.status === 'active' || subscription.status === 'trialing',
        planName: plan.name,
        entitlements: plan.entitlements,
        userLimit: plan.userLimit,
        currentUsers: mockCurrentUsers,
        renewalDate: subscription.renewalDate
    };
};
