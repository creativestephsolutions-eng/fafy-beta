-- Add plan_override to profiles for gifted/upgraded plans
-- When set, the app treats the user as having the override plan
-- while Stripe continues billing their actual subscription.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_override TEXT;
