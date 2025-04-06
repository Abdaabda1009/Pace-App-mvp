export interface Subscription {
  id: string;
  name: string;
  icon: string;
  logoKey?: string; // Added for consistent logo mapping
  price: number;
  renewalDate: string;
  category: string;
  color: string;
  notes?: string; // Renamed from note for consistency with the modal
  isPaused?: boolean;
  isPopular?: boolean; // For highlighting popular subscriptions
  totalUsers?: number; // For showing subscriber count
  usage?: {
    activeSince?: string; // When subscription was started
    lastUsed?: string; // Last time the subscription was accessed/used
    frequency?: string; // How often the subscription is used (e.g. "Daily", "Weekly")
  };
  billingCycle?: "monthly" | "yearly"; // Track billing cycle type
  paymentMethod?: {
    type: string; // Card, PayPal, etc.
    lastFour?: string; // Last four digits if applicable
    expiryDate?: string; // Expiry date if applicable
  };
  billingDate?: string; // Day of month for billing
}

export interface SubscriptionModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onDismiss: () => void;
  onEdit: (subscription: Subscription) => void;
  onPause: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onSave?: (updatedSub: Subscription) => void; // Maintained for backward compatibility
  logoImages: Record<string, any>;
}
