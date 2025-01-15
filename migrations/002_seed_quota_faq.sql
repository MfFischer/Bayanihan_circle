-- Seed: FAQ Data for Quota-Based Dividend System
-- Description: Insert FAQ entries explaining the new quota-based dividend system
-- Date: 2025-11-03

-- Clear existing FAQs (optional - comment out if you want to keep existing ones)
-- DELETE FROM faqs WHERE category IN ('dividends', 'yearend', 'withdrawal');

-- Insert FAQ entries for Dividends & Quota
INSERT INTO faqs (question, answer, category, order_index, status) VALUES
(
  'What is the quota-based dividend system?',
  'The quota-based dividend system is a fair way to distribute year-end earnings to members. Instead of using points, we now use loan interest paid as the basis for dividend calculation. Members who pay ₱5,000 or more in loan interest during the year get the FULL dividend, while members who pay less get a proportional dividend.',
  'dividends',
  1,
  'active'
),
(
  'What is the required loan interest quota?',
  'The required loan interest quota is the minimum amount of loan interest a member must pay during the year to qualify for the full dividend. The default quota is ₱5,000, but your group admin can adjust this in the Group Settings. This quota is set per group and applies to all members.',
  'dividends',
  2,
  'active'
),
(
  'How is the full dividend calculated?',
  'The full dividend is calculated by dividing the total interest earned by the group by the number of members who met the quota. For example: If the group earned ₱400,000 in interest and 80 members met the ₱5,000 quota, then each quota member gets ₱400,000 ÷ 80 = ₱5,000 as their dividend.',
  'dividends',
  3,
  'active'
),
(
  'What if I paid less than the quota?',
  'If you paid less than the quota, you still get a dividend, but it''s proportional to what you paid. For example: If the full dividend is ₱5,000 and you paid ₱2,500 in interest (50% of quota), you get ₱2,500 (50% of full dividend). The formula is: Your Dividend = (Interest Paid ÷ Quota) × Full Dividend.',
  'dividends',
  4,
  'active'
),
(
  'What if I didn''t take any loans?',
  'If you didn''t take any loans, you paid ₱0 in interest, so you don''t qualify for any dividend. You will only receive your share capital (contributions) back at year-end. We encourage all members to participate in loans to build the group''s wealth together.',
  'dividends',
  5,
  'active'
),
(
  'Does it matter how many loans I took?',
  'No, it doesn''t matter how many loans you took. What matters is the TOTAL interest you paid. Whether you took 1 loan or 5 loans, if you paid ₱5,000 in total interest, you get the full dividend. This encourages members to borrow what they need without worrying about the number of loans.',
  'dividends',
  6,
  'active'
),
(
  'Can the quota be changed?',
  'Yes, the group admin can change the required loan interest quota in the Group Settings. If the quota changes, it applies to future years. The current year''s quota is set at the beginning of the year and doesn''t change mid-year.',
  'dividends',
  7,
  'active'
),
(
  'How do I track my interest paid?',
  'You can track your interest paid in your Profile page. It shows your total interest paid for the current year and whether you''ve met the quota. You can also see your dividend amount and all previous years'' tracking data.',
  'dividends',
  8,
  'active'
),
(
  'When is the year-end distribution?',
  'The year-end distribution happens on the date set by your group admin (usually December 20). On that date, all dividends are calculated and distributed to members'' accounts. You can see the exact date in the Group Settings.',
  'yearend',
  1,
  'active'
),
(
  'How is the year-end distribution calculated?',
  'The admin calculates the year-end distribution by: 1) Summing all interest earned by the group during the year, 2) Counting how many members met the quota, 3) Dividing total interest by quota members to get the full dividend, 4) Calculating each member''s dividend based on their interest paid.',
  'yearend',
  2,
  'active'
),
(
  'What happens if I withdraw before year-end?',
  'If you withdraw before year-end, you will not receive the year-end dividend. You will only get your share capital back. We recommend staying until year-end to receive your full dividend.',
  'yearend',
  3,
  'active'
),
(
  'Can I request a withdrawal?',
  'Yes, you can request a withdrawal anytime. However, there is a 30-day waiting period after your last contribution before you''re eligible to withdraw. You also cannot have any active loans or pending contributions. The admin will review and approve your request.',
  'withdrawal',
  1,
  'active'
),
(
  'What is the 30-day waiting period?',
  'The 30-day waiting period is a rule to ensure stability in the group. After you make your last contribution, you must wait 30 days before you can withdraw. This gives the group time to use your capital for loans and ensures fair treatment of all members.',
  'withdrawal',
  2,
  'active'
),
(
  'Can I withdraw if I have active loans?',
  'No, you cannot withdraw if you have active loans. You must pay off all your loans first. This protects the group''s funds and ensures all members fulfill their obligations.',
  'withdrawal',
  3,
  'active'
),
(
  'What happens to my dividend if I withdraw?',
  'If you withdraw before the year-end distribution, you will not receive the year-end dividend. You will only get your share capital (contributions) back. If you withdraw after the year-end distribution, you will receive your dividend along with your capital.',
  'withdrawal',
  4,
  'active'
),
(
  'How long does withdrawal approval take?',
  'Withdrawal requests are reviewed by the admin. The approval time depends on the admin''s schedule, but typically it takes 1-3 business days. Once approved, you can collect your funds.',
  'withdrawal',
  5,
  'active'
),
(
  'What if my withdrawal request is rejected?',
  'If your withdrawal request is rejected, the admin will provide a reason. Common reasons include: active loans, pending contributions, or not meeting the 30-day waiting period. You can address the issue and resubmit your request.',
  'withdrawal',
  6,
  'active'
),
(
  'Can I withdraw my dividend separately from my capital?',
  'No, withdrawals are processed as a lump sum including both your share capital and any earned dividends. You cannot withdraw just the dividend or just the capital separately.',
  'withdrawal',
  7,
  'active'
),
(
  'What is share capital?',
  'Share capital is the money you contributed to the group. When you make a contribution, 90% goes to your share capital (after 10% management fee). This is your ownership stake in the group and is returned to you when you withdraw.',
  'general',
  1,
  'active'
),
(
  'How is the management fee calculated?',
  'The management fee is a percentage of each contribution (default 10%). This fee covers group operations and admin costs. For example: If you contribute ₱1,000 and the fee is 10%, you pay ₱100 in fees and ₱900 goes to your share capital.',
  'general',
  2,
  'active'
),
(
  'Who receives the management fees?',
  'The management fees are split between the admin (who runs the group) and the platform. The admin commission percentage is set in Group Settings. This ensures the admin is compensated for their work managing the group.',
  'general',
  3,
  'active'
),
(
  'Can I see my transaction history?',
  'Yes, you can see all your transactions in your Profile page. This includes contributions, loans, payments, dividends, and withdrawals. Each transaction shows the date, type, and amount.',
  'general',
  4,
  'active'
),
(
  'How do I contact the admin?',
  'You can contact your group admin directly through the app or through the contact information provided by your group. The admin is responsible for approving loans, recording contributions, and managing group settings.',
  'general',
  5,
  'active'
);

-- Insert FAQ entries for Contributions
INSERT INTO faqs (question, answer, category, order_index, status) VALUES
(
  'What is a contribution?',
  'A contribution is money you give to the group to build your share capital. Regular contributions show commitment to the group and increase your borrowing power. Contributions are usually due on a specific day each month.',
  'contributions',
  1,
  'active'
),
(
  'What is the minimum contribution?',
  'The minimum contribution is set by your group admin in the Group Settings. The default is ₱1,000 per month. You can contribute more if you want to increase your share capital faster.',
  'contributions',
  2,
  'active'
),
(
  'What happens if I miss a contribution?',
  'If you miss a contribution, it will be marked as pending. The admin can record it later, but there may be penalties depending on how late it is. It''s best to contribute on time to avoid penalties and maintain good standing.',
  'contributions',
  3,
  'active'
),
(
  'Can I contribute more than the minimum?',
  'Yes, you can contribute more than the minimum amount. Extra contributions increase your share capital and your borrowing power. The more you contribute, the more you can borrow.',
  'contributions',
  4,
  'active'
);

-- Insert FAQ entries for Loans
INSERT INTO faqs (question, answer, category, order_index, status) VALUES
(
  'How much can I borrow?',
  'The maximum loan amount is based on your share capital and the loan multiplier set by your group admin. For example: If your share capital is ₱10,000 and the multiplier is 3, you can borrow up to ₱30,000.',
  'loans',
  1,
  'active'
),
(
  'What is the loan interest rate?',
  'The loan interest rate is set by your group admin in the Group Settings. The default is 2% per month. This interest is paid back to the group and distributed as dividends at year-end.',
  'loans',
  2,
  'active'
),
(
  'How long can I borrow for?',
  'The maximum loan term is set by your group admin (default 12 months). You can choose a shorter term if you want to pay back faster. Shorter terms mean lower total interest.',
  'loans',
  3,
  'active'
),
(
  'How is my monthly payment calculated?',
  'Your monthly payment is calculated to pay off the loan evenly over the term. The formula is: Monthly Payment = (Loan Amount + Total Interest) ÷ Number of Months. For example: ₱10,000 loan at 2% for 12 months = ₱10,000 + ₱2,400 interest = ₱12,400 ÷ 12 = ₱1,033/month.',
  'loans',
  4,
  'active'
),
(
  'What if I pay late?',
  'Late payments may result in penalties. The exact penalty depends on your group''s rules. It''s important to pay on time to maintain good standing and avoid penalties.',
  'loans',
  5,
  'active'
),
(
  'Can I pay off my loan early?',
  'Yes, you can pay off your loan early. When you do, you only pay interest for the months you actually borrowed. This saves you money on interest.',
  'loans',
  6,
  'active'
),
(
  'Can I take multiple loans?',
  'Yes, you can take multiple loans as long as you don''t exceed your maximum borrowing limit. Each loan is tracked separately and you must make payments on all active loans.',
  'loans',
  7,
  'active'
);

-- Verify insertion
SELECT COUNT(*) as total_faqs FROM faqs WHERE category IN ('dividends', 'yearend', 'withdrawal', 'general', 'contributions', 'loans');

