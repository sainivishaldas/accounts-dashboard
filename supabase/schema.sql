-- =============================================
-- CirclePe × Truliv Accounts Dashboard Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed', 'advance');
CREATE TYPE disbursement_status AS ENUM ('fully_disbursed', 'partial');
CREATE TYPE repayment_status AS ENUM ('on_time', 'overdue', 'advance_paid');
CREATE TYPE current_status AS ENUM ('active', 'move_out', 'early_move_out', 'extended');
CREATE TYPE property_status AS ENUM ('active', 'inactive');
CREATE TYPE disbursement_type AS ENUM ('1st Tranche', '2nd Tranche', 'Final');
CREATE TYPE payment_mode AS ENUM ('Manual', 'NACH');

-- =============================================
-- TABLES
-- =============================================

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    number_of_units INTEGER DEFAULT 0,
    property_manager_name TEXT,
    property_manager_number TEXT,
    status property_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Residents Table
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    room_number TEXT,
    relationship_manager TEXT,
    rm_contact TEXT,
    lease_start_date DATE,
    lease_end_date DATE,
    lock_in_period INTEGER DEFAULT 6,
    monthly_rent DECIMAL(12, 2) DEFAULT 0,
    security_deposit DECIMAL(12, 2) DEFAULT 0,
    total_advance_disbursed DECIMAL(12, 2) DEFAULT 0,
    disbursement_status disbursement_status DEFAULT 'partial',
    repayment_status repayment_status DEFAULT 'on_time',
    current_status current_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disbursements Table
CREATE TABLE disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disbursement_id TEXT UNIQUE NOT NULL,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    utr_number TEXT,
    type disbursement_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repayments Table
CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repayment_id TEXT UNIQUE NOT NULL,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    due_date DATE NOT NULL,
    rent_amount DECIMAL(12, 2) NOT NULL,
    payment_mode payment_mode DEFAULT 'Manual',
    status payment_status DEFAULT 'pending',
    actual_payment_date DATE,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    is_advance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_residents_property ON residents(property_id);
CREATE INDEX idx_residents_status ON residents(current_status);
CREATE INDEX idx_residents_repayment_status ON residents(repayment_status);
CREATE INDEX idx_disbursements_resident ON disbursements(resident_id);
CREATE INDEX idx_repayments_resident ON repayments(resident_id);
CREATE INDEX idx_repayments_status ON repayments(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at
    BEFORE UPDATE ON residents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disbursements_updated_at
    BEFORE UPDATE ON disbursements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repayments_updated_at
    BEFORE UPDATE ON repayments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR PROPERTIES
-- =============================================

-- Allow public read access to properties
CREATE POLICY "Allow public read access to properties"
ON properties FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert properties
CREATE POLICY "Allow authenticated insert on properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update properties
CREATE POLICY "Allow authenticated update on properties"
ON properties FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete properties
CREATE POLICY "Allow authenticated delete on properties"
ON properties FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- RLS POLICIES FOR RESIDENTS
-- =============================================

-- Allow public read access to residents
CREATE POLICY "Allow public read access to residents"
ON residents FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert residents
CREATE POLICY "Allow authenticated insert on residents"
ON residents FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update residents
CREATE POLICY "Allow authenticated update on residents"
ON residents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete residents
CREATE POLICY "Allow authenticated delete on residents"
ON residents FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- RLS POLICIES FOR DISBURSEMENTS
-- =============================================

-- Allow public read access to disbursements
CREATE POLICY "Allow public read access to disbursements"
ON disbursements FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert disbursements
CREATE POLICY "Allow authenticated insert on disbursements"
ON disbursements FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update disbursements
CREATE POLICY "Allow authenticated update on disbursements"
ON disbursements FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete disbursements
CREATE POLICY "Allow authenticated delete on disbursements"
ON disbursements FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- RLS POLICIES FOR REPAYMENTS
-- =============================================

-- Allow public read access to repayments
CREATE POLICY "Allow public read access to repayments"
ON repayments FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert repayments
CREATE POLICY "Allow authenticated insert on repayments"
ON repayments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update repayments
CREATE POLICY "Allow authenticated update on repayments"
ON repayments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete repayments
CREATE POLICY "Allow authenticated delete on repayments"
ON repayments FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- VIEWS FOR DASHBOARD STATISTICS
-- =============================================

-- Summary statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    COALESCE(SUM(r.total_advance_disbursed), 0) AS total_disbursed,
    COALESCE(SUM(
        CASE WHEN rep.status IN ('paid', 'advance') THEN rep.amount_paid ELSE 0 END
    ), 0) AS total_collected,
    COALESCE(SUM(
        CASE WHEN rep.status IN ('pending', 'failed') THEN rep.rent_amount ELSE 0 END
    ), 0) AS total_outstanding,
    COUNT(DISTINCT r.id) AS total_residents,
    COUNT(DISTINCT CASE WHEN r.repayment_status = 'overdue' THEN r.id END) AS overdue_count,
    COUNT(DISTINCT CASE WHEN r.repayment_status = 'advance_paid' THEN r.id END) AS advance_count,
    COUNT(DISTINCT CASE WHEN r.repayment_status = 'on_time' THEN r.id END) AS on_time_count,
    COUNT(DISTINCT CASE WHEN r.lease_end_date >= CURRENT_DATE THEN r.id END) AS active_count,
    COUNT(DISTINCT CASE WHEN r.lease_end_date < CURRENT_DATE THEN r.id END) AS inactive_count
FROM residents r
LEFT JOIN repayments rep ON rep.resident_id = r.id;

-- =============================================
-- SEED DATA (Optional - Remove if not needed)
-- =============================================

-- Insert Properties
INSERT INTO properties (property_id, name, address, city, number_of_units, property_manager_name, property_manager_number, status) VALUES
('PROP001', 'Truliv Koramangala', '45, 4th Block, Koramangala, Bangalore - 560034', 'Bangalore', 45, 'Rajesh Kumar', '+91 98765 12345', 'active'),
('PROP002', 'Truliv HSR Layout', '78, Sector 2, HSR Layout, Bangalore - 560102', 'Bangalore', 32, 'Sunita Devi', '+91 99988 77665', 'active'),
('PROP003', 'Truliv Indiranagar', '23, 12th Main, Indiranagar, Bangalore - 560038', 'Bangalore', 28, 'Mohan Rao', '+91 88776 65544', 'active'),
('PROP004', 'Truliv Whitefield', '56, ITPL Main Road, Whitefield, Bangalore - 560066', 'Bangalore', 40, 'Lakshmi Narayanan', '+91 77665 54433', 'active'),
('PROP005', 'Truliv Powai', '12, Hiranandani Gardens, Powai, Mumbai - 400076', 'Mumbai', 35, 'Anita Deshmukh', '+91 88221 13344', 'active'),
('PROP006', 'Truliv Andheri', '89, Lokhandwala Complex, Andheri West, Mumbai - 400053', 'Mumbai', 30, 'Vinod Sharma', '+91 77332 21100', 'active'),
('PROP007', 'Truliv Gurgaon', '34, Cyber City, DLF Phase 2, Gurgaon - 122002', 'Gurgaon', 56, 'Suresh Yadav', '+91 99554 43322', 'active'),
('PROP008', 'Truliv Noida', '67, Sector 62, Noida - 201301', 'Noida', 42, 'Rakesh Gupta', '+91 88665 54433', 'active');

-- Insert Residents (with references to properties)
INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES001', 'Arjun Mehta', 'arjun.mehta@email.com', '+91 98765 43210',
    id, 'A-204', 'Priya Sharma', '+91 99887 76655',
    '2024-01-15', '2025-01-14', 6, 25000, 50000, 300000, 'fully_disbursed', 'on_time', 'active'
FROM properties WHERE property_id = 'PROP001';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES002', 'Sneha Reddy', 'sneha.reddy@email.com', '+91 87654 32109',
    id, 'B-102', 'Amit Verma', '+91 98876 54321',
    '2024-02-01', '2025-01-31', 6, 22000, 44000, 264000, 'fully_disbursed', 'overdue', 'move_out'
FROM properties WHERE property_id = 'PROP002';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES003', 'Vikram Singh', 'vikram.singh@email.com', '+91 76543 21098',
    id, 'C-305', 'Priya Sharma', '+91 99887 76655',
    '2024-03-01', '2025-02-28', 11, 35000, 70000, 420000, 'fully_disbursed', 'advance_paid', 'extended'
FROM properties WHERE property_id = 'PROP003';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES004', 'Neha Patel', 'neha.patel@email.com', '+91 65432 10987',
    id, 'D-401', 'Amit Verma', '+91 98876 54321',
    '2024-01-01', '2024-12-31', 6, 28000, 56000, 168000, 'partial', 'on_time', 'active'
FROM properties WHERE property_id = 'PROP004';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES005', 'Rahul Gupta', 'rahul.gupta@email.com', '+91 54321 09876',
    id, 'E-201', 'Deepak Joshi', '+91 99112 23344',
    '2024-02-15', '2025-02-14', 6, 32000, 64000, 384000, 'fully_disbursed', 'on_time', 'active'
FROM properties WHERE property_id = 'PROP005';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES006', 'Kavya Nair', 'kavya.nair@email.com', '+91 43210 98765',
    id, 'F-103', 'Deepak Joshi', '+91 99112 23344',
    '2024-03-10', '2025-03-09', 6, 27000, 54000, 324000, 'fully_disbursed', 'overdue', 'early_move_out'
FROM properties WHERE property_id = 'PROP006';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES007', 'Aditya Jain', 'aditya.jain@email.com', '+91 32109 87654',
    id, 'G-502', 'Meera Kapoor', '+91 98443 32211',
    '2024-01-20', '2025-01-19', 6, 30000, 60000, 360000, 'fully_disbursed', 'on_time', 'active'
FROM properties WHERE property_id = 'PROP007';

INSERT INTO residents (resident_id, name, email, phone, property_id, room_number, relationship_manager, rm_contact, lease_start_date, lease_end_date, lock_in_period, monthly_rent, security_deposit, total_advance_disbursed, disbursement_status, repayment_status, current_status)
SELECT 
    'RES008', 'Priyanka Chopra', 'priyanka.c@email.com', '+91 21098 76543',
    id, 'H-304', 'Meera Kapoor', '+91 98443 32211',
    '2024-02-05', '2025-02-04', 6, 24000, 48000, 288000, 'fully_disbursed', 'advance_paid', 'extended'
FROM properties WHERE property_id = 'PROP008';

-- Insert Disbursements
INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D001', id, '2024-01-10', 150000, 'UTR2024011012345', '1st Tranche' FROM residents WHERE resident_id = 'RES001';
INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D002', id, '2024-01-12', 150000, 'UTR2024011254321', '2nd Tranche' FROM residents WHERE resident_id = 'RES001';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D003', id, '2024-01-28', 264000, 'UTR2024012898765', '1st Tranche' FROM residents WHERE resident_id = 'RES002';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D004', id, '2024-02-25', 210000, 'UTR2024022543210', '1st Tranche' FROM residents WHERE resident_id = 'RES003';
INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D005', id, '2024-02-27', 210000, 'UTR2024022754321', '2nd Tranche' FROM residents WHERE resident_id = 'RES003';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D006', id, '2023-12-28', 168000, 'UTR2023122876543', '1st Tranche' FROM residents WHERE resident_id = 'RES004';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D007', id, '2024-02-10', 192000, 'UTR2024021087654', '1st Tranche' FROM residents WHERE resident_id = 'RES005';
INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D008', id, '2024-02-12', 192000, 'UTR2024021298765', 'Final' FROM residents WHERE resident_id = 'RES005';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D009', id, '2024-03-05', 324000, 'UTR2024030521098', '1st Tranche' FROM residents WHERE resident_id = 'RES006';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D010', id, '2024-01-15', 180000, 'UTR2024011532109', '1st Tranche' FROM residents WHERE resident_id = 'RES007';
INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D011', id, '2024-01-18', 180000, 'UTR2024011843210', '2nd Tranche' FROM residents WHERE resident_id = 'RES007';

INSERT INTO disbursements (disbursement_id, resident_id, date, amount, utr_number, type)
SELECT 'D012', id, '2024-02-01', 288000, 'UTR2024020121098', '1st Tranche' FROM residents WHERE resident_id = 'RES008';

-- Insert Repayments for RES001
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R001', id, 'February 2024', '2024-02-05', 25000, 'NACH', 'paid', '2024-02-05', 25000, false FROM residents WHERE resident_id = 'RES001';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R002', id, 'March 2024', '2024-03-05', 25000, 'NACH', 'paid', '2024-03-04', 25000, false FROM residents WHERE resident_id = 'RES001';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R003', id, 'April 2024', '2024-04-05', 25000, 'NACH', 'paid', '2024-04-05', 25000, false FROM residents WHERE resident_id = 'RES001';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R004', id, 'May 2024', '2024-05-05', 25000, 'NACH', 'paid', '2024-05-03', 25000, true FROM residents WHERE resident_id = 'RES001';

-- Insert Repayments for RES002
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R005', id, 'March 2024', '2024-03-05', 22000, 'Manual', 'paid', '2024-03-08', 22000, false FROM residents WHERE resident_id = 'RES002';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R006', id, 'April 2024', '2024-04-05', 22000, 'Manual', 'paid', '2024-04-12', 22000, false FROM residents WHERE resident_id = 'RES002';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R007', id, 'May 2024', '2024-05-05', 22000, 'Manual', 'failed', NULL, 0, false FROM residents WHERE resident_id = 'RES002';

-- Insert Repayments for RES003
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R008', id, 'April 2024', '2024-04-05', 35000, 'NACH', 'paid', '2024-04-01', 35000, true FROM residents WHERE resident_id = 'RES003';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R009', id, 'May 2024', '2024-05-05', 35000, 'NACH', 'advance', '2024-04-20', 70000, true FROM residents WHERE resident_id = 'RES003';

-- Insert Repayments for RES004
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R010', id, 'February 2024', '2024-02-05', 28000, 'NACH', 'paid', '2024-02-05', 28000, false FROM residents WHERE resident_id = 'RES004';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R011', id, 'March 2024', '2024-03-05', 28000, 'NACH', 'paid', '2024-03-05', 28000, false FROM residents WHERE resident_id = 'RES004';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R012', id, 'April 2024', '2024-04-05', 28000, 'NACH', 'paid', '2024-04-05', 28000, false FROM residents WHERE resident_id = 'RES004';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R013', id, 'May 2024', '2024-05-05', 28000, 'NACH', 'pending', NULL, 0, false FROM residents WHERE resident_id = 'RES004';

-- Insert Repayments for RES005
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R014', id, 'March 2024', '2024-03-15', 32000, 'NACH', 'paid', '2024-03-15', 32000, false FROM residents WHERE resident_id = 'RES005';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R015', id, 'April 2024', '2024-04-15', 32000, 'NACH', 'paid', '2024-04-15', 32000, false FROM residents WHERE resident_id = 'RES005';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R016', id, 'May 2024', '2024-05-15', 32000, 'NACH', 'paid', '2024-05-14', 32000, false FROM residents WHERE resident_id = 'RES005';

-- Insert Repayments for RES006
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R017', id, 'April 2024', '2024-04-10', 27000, 'Manual', 'paid', '2024-04-15', 27000, false FROM residents WHERE resident_id = 'RES006';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R018', id, 'May 2024', '2024-05-10', 27000, 'Manual', 'failed', NULL, 0, false FROM residents WHERE resident_id = 'RES006';

-- Insert Repayments for RES007
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R019', id, 'February 2024', '2024-02-20', 30000, 'NACH', 'paid', '2024-02-20', 30000, false FROM residents WHERE resident_id = 'RES007';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R020', id, 'March 2024', '2024-03-20', 30000, 'NACH', 'paid', '2024-03-20', 30000, false FROM residents WHERE resident_id = 'RES007';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R021', id, 'April 2024', '2024-04-20', 30000, 'NACH', 'paid', '2024-04-20', 30000, false FROM residents WHERE resident_id = 'RES007';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R022', id, 'May 2024', '2024-05-20', 30000, 'NACH', 'paid', '2024-05-18', 30000, false FROM residents WHERE resident_id = 'RES007';

-- Insert Repayments for RES008
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R023', id, 'March 2024', '2024-03-05', 24000, 'NACH', 'paid', '2024-03-01', 24000, true FROM residents WHERE resident_id = 'RES008';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R024', id, 'April 2024', '2024-04-05', 24000, 'NACH', 'paid', '2024-03-28', 24000, true FROM residents WHERE resident_id = 'RES008';
INSERT INTO repayments (repayment_id, resident_id, month, due_date, rent_amount, payment_mode, status, actual_payment_date, amount_paid, is_advance)
SELECT 'R025', id, 'May 2024', '2024-05-05', 24000, 'NACH', 'advance', '2024-04-25', 48000, true FROM residents WHERE resident_id = 'RES008';

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables for anon and authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant full access to authenticated users
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
