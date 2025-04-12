import { supabase } from "./supabase";
import { Subscription } from "../Components/Calender/types";

export interface PaymentMethod {
  type: string;
  lastFour?: string;
  expiryDate?: string;
}

export interface NewSubscription {
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  renewal_date: string;
  billing_cycle: "monthly" | "yearly" | "quarterly";
  payment_method: PaymentMethod;
  notes: string;
  logo: string | null;
}

export interface SubscriptionResponse {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  renewal_date: string;
  billing_cycle: "monthly" | "yearly" | "quarterly";
  payment_method: PaymentMethod;
  notes: string;
  logo: string | null;
}

export const createSubscription = async (
  subscription: NewSubscription
): Promise<Subscription | null> => {
  try {
    console.log("Creating new subscription with data:", subscription);

    // Validate required fields
    if (!subscription.name || !subscription.price || !subscription.category) {
      console.error("Missing required fields in subscription data");
      return null;
    }

    const subscriptionData = {
      name: subscription.name,
      price: subscription.price,
      category: subscription.category,
      icon: subscription.icon,
      color: subscription.color,
      renewal_date: subscription.renewal_date,
      billing_cycle: subscription.billing_cycle,
      payment_method: subscription.payment_method,
      notes: subscription.notes || "",
      logo: subscription.logo,
    };

    console.log("Sending data to Supabase:", subscriptionData);

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating subscription:", error);
      throw error;
    }

    console.log("Supabase response data:", data);

    if (!data) {
      console.error("No data returned from Supabase after insert");
      return null;
    }

    // Transform the data to match our Subscription type
    const transformedData = transformDatabaseResponse(data);
    console.log("Transformed subscription data:", transformedData);

    return transformedData;
  } catch (error) {
    console.error("Error in createSubscription:", error);
    return null;
  }
};

export const updateSubscription = async (
  id: string,
  subscription: Partial<NewSubscription>
): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(subscription)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return null;
  }
};

export const deleteSubscription = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting subscription:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return false;
  }
};

export const getSubscription = async (
  id: string
): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      throw error;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
};

export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  try {
    console.log("Fetching subscriptions from database...");
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("renewal_date", { ascending: true });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    console.log("Raw database response:", data);

    if (!data || data.length === 0) {
      console.log("No subscriptions found in database");
      return [];
    }

    const transformedData = data.map(transformDatabaseResponse);
    console.log("Transformed subscriptions:", transformedData);
    return transformedData.filter(
      (item): item is Subscription => item !== null
    );
  } catch (error) {
    console.error("Error in getAllSubscriptions:", error);
    return [];
  }
};

const transformDatabaseResponse = (
  data: SubscriptionResponse
): Subscription | null => {
  if (!data) return null;

  try {
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      category: data.category,
      icon: data.icon,
      color: data.color,
      renewalDate: data.renewal_date,
      billingCycle: data.billing_cycle,
      paymentMethod: {
        type: data.payment_method.type,
        lastFour: data.payment_method.lastFour,
        expiryDate: data.payment_method.expiryDate,
      },
      notes: data.notes,
      logo: data.logo,
    };
  } catch (error) {
    console.error("Error transforming subscription data:", error);
    return null;
  }
};
