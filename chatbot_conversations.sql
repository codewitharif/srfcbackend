-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 14, 2026 at 11:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `srfc`
--

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_conversations`
--

CREATE TABLE `chatbot_conversations` (
  `id` int(11) NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `mobile_number` varchar(15) DEFAULT NULL,
  `channel` varchar(50) DEFAULT NULL,
  `message_type` varchar(50) DEFAULT NULL,
  `message_text` text DEFAULT NULL,
  `intent` varchar(100) DEFAULT NULL,
  `entities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`entities`)),
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `context_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context_data`)),
  `response_time_ms` int(11) DEFAULT NULL,
  `session_start` timestamp NULL DEFAULT NULL,
  `session_end` timestamp NULL DEFAULT NULL,
  `is_session_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_conversations`
--

INSERT INTO `chatbot_conversations` (`id`, `session_id`, `customer_id`, `mobile_number`, `channel`, `message_type`, `message_text`, `intent`, `entities`, `confidence_score`, `context_data`, `response_time_ms`, `session_start`, `session_end`, `is_session_active`, `created_at`) VALUES
(1, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'Hello! I can help you with various loan products. Please choose a product category:', NULL, NULL, NULL, '{}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:24'),
(2, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'Great choice! Here are the categories under \'Personal Needs\':', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:25'),
(3, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'You\'ve selected \'Two Wheeler Loan\'. There are no further subcategories available. Let\'s find out your loan details for this. How much loan amount do you need?', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:27'),
(4, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'user_message', '120000', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:38'),
(5, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'Okay, for a loan of ₹120000. For how many months would you like to take the loan?', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:38'),
(6, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'user_message', '12', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:41'),
(7, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'Your estimated EMI for a loan of ₹120000 over 12 months is ₹10466.37 per month. Shall I proceed with this?', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:41'),
(8, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'bot_response', 'Thank you for answering all the questions! Now, may I have your mobile number to check if you are an existing customer?\nPlease enter your mobile number below.', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:44'),
(9, 'sess_1770981069033ofy93jm31', NULL, NULL, 'web_chat', 'user_message', '7772884698', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:55'),
(10, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'bot_response', 'No existing customer found. Please provide your full name (e.g., First Last).', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:56:55'),
(11, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'user_message', 'sam', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:01'),
(12, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'bot_response', 'Please provide your email address.', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\",\"full_name\":\"sam\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:01'),
(13, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'user_message', 'sam@test.com', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\",\"full_name\":\"sam\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:08'),
(14, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'bot_response', 'Please provide your date of birth (e.g., YYYY-MM-DD or DD-MM-YYYY).', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\",\"full_name\":\"sam\",\"email\":\"sam@test.com\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:08'),
(15, 'sess_1770981069033ofy93jm31', NULL, '7772884698', 'web_chat', 'user_message', '15-02-2003', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\",\"full_name\":\"sam\",\"email\":\"sam@test.com\"}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:14'),
(16, 'sess_1770981069033ofy93jm31', 1, '7772884698', 'web_chat', 'bot_response', 'Your draft application #APP-1771063034056-126 has been created successfully! A representative will contact you shortly. You can now upload your documents. Is there anything else?', NULL, NULL, NULL, '{\"productId\":1,\"productName\":\"Personal Needs\",\"categoryId\":1,\"categoryName\":\"Two Wheeler Loan\",\"selectedLoanLevel\":\"category\",\"loanAmount\":120000,\"tenureMonths\":12,\"activeCharge\":{\"id\":4,\"loan_category_id\":1,\"loan_subcategory_id\":null,\"interest_rate_type\":\"reducing\",\"min_interest_rate\":\"8.50\",\"max_interest_rate\":\"12.50\",\"processing_fee_percentage\":\"1.00\",\"processing_fee_fixed\":null,\"documentation_charges\":\"500.00\",\"late_payment_penalty\":\"2.00\",\"prepayment_charges\":\"2.00\",\"min_loan_amount\":\"50000.00\",\"max_loan_amount\":\"500000.00\",\"min_tenure_months\":12,\"max_tenure_months\":48,\"effective_from\":\"2023-12-31T18:30:00.000Z\",\"effective_to\":\"2025-12-30T18:30:00.000Z\",\"is_active\":1,\"created_at\":\"2026-02-10T09:59:23.000Z\"},\"emi\":10466.37,\"mobile_number\":\"7772884698\",\"full_name\":\"sam\",\"email\":\"sam@test.com\",\"dob\":\"15-02-2003\",\"customer\":{\"id\":1,\"customer_code\":null,\"full_name\":\"sam\",\"date_of_birth\":\"2003-02-14T18:30:00.000Z\",\"gender\":null,\"mobile_number\":\"7772884698\",\"alternate_mobile\":null,\"email\":\"sam@test.com\",\"pan_number\":null,\"aadhaar_number\":null,\"kyc_status\":null,\"kyc_completed_at\":null,\"credit_score\":null,\"credit_score_updated_at\":null,\"is_active\":null,\"created_at\":\"2026-02-14T09:57:14.000Z\",\"updated_at\":\"2026-02-14T09:57:14.000Z\"},\"loanQuestions\":{\"error\":\"Unknown column \'loan_product_id\' in \'where clause\'\"},\"currentQuestionIndex\":0,\"loan_application_id\":1}', NULL, '2026-02-13 05:41:09', NULL, 1, '2026-02-14 09:57:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversations_session` (`session_id`),
  ADD KEY `idx_conversations_customer` (`customer_id`),
  ADD KEY `idx_conversations_mobile` (`mobile_number`),
  ADD KEY `idx_conversations_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chatbot_conversations`
--
ALTER TABLE `chatbot_conversations`
  ADD CONSTRAINT `chatbot_conversations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
