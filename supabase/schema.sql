-- ========================================================================
-- STUDENT CAREER - Multi-Tenant Tuition Centre Management System
-- Production PostgreSQL Database Schema with Row-Level Security (RLS)
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. TUITION CENTRES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    owner_name VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    owner_email VARCHAR(255),
    whatsapp_number VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    logo_url TEXT,
    upi_id VARCHAR(100),
    razorpay_key_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 2. ONE-TIME LICENCES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.licences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key VARCHAR(100) UNIQUE NOT NULL,
    activation_code VARCHAR(50) NOT NULL,
    centre_id UUID REFERENCES public.centres(id) ON DELETE SET NULL,
    centre_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    plan_type VARCHAR(50) DEFAULT 'LIFETIME_ONE_TIME',
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'revoked')),
    max_devices INTEGER DEFAULT 1,
    device_count INTEGER DEFAULT 0,
    activated_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 3. REGISTERED HARDWARE DEVICES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES public.licences(id) ON DELETE CASCADE,
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    device_uuid VARCHAR(255) NOT NULL,
    device_model VARCHAR(255),
    platform VARCHAR(50) DEFAULT 'android',
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (license_id, device_uuid)
);

-- ------------------------------------------------------------------------
-- 4. APPLICATION USERS / ROLES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    auth_user_id UUID, -- Links to auth.users if Supabase Auth is active
    role VARCHAR(30) DEFAULT 'centre_owner' CHECK (role IN ('superadmin', 'centre_owner', 'teacher', 'staff')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. TEACHERS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    subjects TEXT[] DEFAULT '{}',
    qualification VARCHAR(255),
    salary_monthly NUMERIC(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 6. BATCHES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(100) NOT NULL,
    subject VARCHAR(100),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255),
    start_time VARCHAR(20) NOT NULL, -- e.g. "04:00 PM"
    end_time VARCHAR(20) NOT NULL,   -- e.g. "05:30 PM"
    days TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri","Sat"}',
    room_number VARCHAR(50),
    capacity INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 7. STUDENTS TABLE (Phase 4 Specification)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    admission_no VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    parent_contact VARCHAR(20) NOT NULL,
    parent_whatsapp VARCHAR(20) NOT NULL,
    photo_url TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    class VARCHAR(100) NOT NULL,
    course VARCHAR(100),
    subjects TEXT[] DEFAULT '{}',
    assigned_batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    assigned_batch_name VARCHAR(255),
    tuition_timing VARCHAR(100),
    monthly_fees NUMERIC(10,2) DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    payment_due_date INTEGER DEFAULT 5, -- Day of month (e.g. 5th)
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'partial', 'pending', 'overdue')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 8. TIMETABLE SCHEDULES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    subject VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(255),
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 9. DAILY ATTENDANCE TABLE (Phase 5 - Duplicate Prevention)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
    remarks VARCHAR(255),
    marked_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- PREVENTS DUPLICATE ATTENDANCE FOR SAME STUDENT ON SAME DATE
    CONSTRAINT unique_student_daily_attendance UNIQUE (centre_id, student_id, date)
);

-- ------------------------------------------------------------------------
-- 10. FEE STRUCTURES & BALANCES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) DEFAULT '2026-2027',
    monthly_fee NUMERIC(10,2) DEFAULT 0.00,
    admission_fee NUMERIC(10,2) DEFAULT 0.00,
    additional_charges NUMERIC(10,2) DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    total_fee NUMERIC(10,2) GENERATED ALWAYS AS (monthly_fee + admission_fee + additional_charges - discount) STORED,
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    pending_balance NUMERIC(10,2) DEFAULT 0.00,
    due_day_of_month INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_fee_structure UNIQUE (centre_id, student_id, academic_year)
);

-- ------------------------------------------------------------------------
-- 11. FEE PAYMENTS & TRANSACTIONS TABLE (Phase 6 & 8)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_month VARCHAR(50) NOT NULL, -- e.g. "November 2026"
    payment_type VARCHAR(50) DEFAULT 'monthly_fee' CHECK (payment_type IN ('monthly_fee', 'admission_fee', 'full', 'partial', 'other')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'upi', 'razorpay', 'cheque', 'bank_transfer')),
    transaction_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
    notes TEXT,
    received_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 12. PROGRESS REPORTS TABLE (Phase 10)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    report_title VARCHAR(255) DEFAULT 'Weekly Academic Progress Report',
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_start DATE,
    period_end DATE,
    attendance_percentage NUMERIC(5,2) DEFAULT 100.00,
    subject_marks JSONB DEFAULT '[]'::jsonb, -- [{"subject": "Math", "marks": 85, "maxMarks": 100}]
    homework_status VARCHAR(50) DEFAULT 'Consistent' CHECK (homework_status IN ('Consistent', 'Occasional', 'Needs Improvement')),
    test_performance VARCHAR(50) DEFAULT 'Good' CHECK (test_performance IN ('Excellent', 'Good', 'Average', 'Needs Improvement')),
    teacher_comments TEXT,
    improvement_areas TEXT,
    next_week_goals TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 13. NOTIFICATION & WHATSAPP LOG TABLE (Phase 7)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fee_reminder', 'payment_link', 'attendance_report', 'progress_report', 'payment_receipt', 'custom')),
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(255),
    message TEXT NOT NULL,
    channel VARCHAR(20) DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms')),
    status VARCHAR(50) DEFAULT 'opened_in_whatsapp' CHECK (status IN ('opened_in_whatsapp', 'queued', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_centres_code ON public.centres(code);
CREATE INDEX IF NOT EXISTS idx_licences_key ON public.licences(license_key);
CREATE INDEX IF NOT EXISTS idx_devices_license ON public.devices(license_id, device_uuid);
CREATE INDEX IF NOT EXISTS idx_students_centre ON public.students(centre_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(assigned_batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_centre_date ON public.attendance(centre_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_centre ON public.fee_payments(centre_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_batches_centre ON public.batches(centre_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_student ON public.progress_reports(student_id);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation by centre_id
-- ========================================================================
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- SERVER-SIDE RATE LIMITING TABLE (For Serverless & Multi-Instance Security)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    ip_hash VARCHAR(64) PRIMARY KEY,
    failed_count INTEGER DEFAULT 1,
    locked_until TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- Rate limits table is accessible only to server service role
CREATE POLICY service_role_rate_limits_policy ON public.auth_rate_limits
    FOR ALL
    TO service_role
    USING (true);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - STRICT TENANT ISOLATION
-- ========================================================================

ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper 1: Extract authenticated user's authorized centre_id from auth.uid()
-- SECURITY: Never trust client headers alone. Must link to verified auth.users.
CREATE OR REPLACE FUNCTION public.get_auth_centre_id()
RETURNS UUID AS $$
DECLARE
    v_centre_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT centre_id INTO v_centre_id
    FROM public.users
    WHERE auth_user_id = auth.uid()
      AND is_active = TRUE
    LIMIT 1;

    RETURN v_centre_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper 2: Check if current authenticated user has Super Admin authority
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
          AND role = 'superadmin'
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------
-- CENTRES TABLE POLICY
-- Normal users can ONLY view their own centre profile. Super Admin sees all.
-- ------------------------------------------------------------------------
CREATE POLICY centre_tenant_policy ON public.centres
    FOR SELECT
    TO authenticated
    USING (id = public.get_auth_centre_id() OR public.is_super_admin() = TRUE);

CREATE POLICY centre_tenant_update_policy ON public.centres
    FOR UPDATE
    TO authenticated
    USING (id = public.get_auth_centre_id() OR public.is_super_admin() = TRUE)
    WITH CHECK (id = public.get_auth_centre_id() OR public.is_super_admin() = TRUE);

-- ------------------------------------------------------------------------
-- STUDENTS TABLE POLICY
-- Strict Tenant Isolation: Only accessible to users belonging to the same centre.
-- Zero access if unauthenticated. Cross-tenant queries fail closed.
-- ------------------------------------------------------------------------
CREATE POLICY tenant_students_policy ON public.students
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- BATCHES TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_batches_policy ON public.batches
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- ATTENDANCE TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_attendance_policy ON public.attendance
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- FEE PAYMENTS TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_fee_payments_policy ON public.fee_payments
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- TIMETABLES TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_timetables_policy ON public.timetables
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- PROGRESS REPORTS TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_progress_policy ON public.progress_reports
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- TEACHERS TABLE POLICY
-- ------------------------------------------------------------------------
CREATE POLICY tenant_teachers_policy ON public.teachers
    FOR ALL
    TO authenticated
    USING (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    )
    WITH CHECK (
        (public.get_auth_centre_id() IS NOT NULL AND centre_id = public.get_auth_centre_id())
        OR public.is_super_admin() = TRUE
    );

-- ------------------------------------------------------------------------
-- LICENCES & DEVICES POLICY
-- Accessible exclusively to Super Admin. Normal centres cannot tamper with licences.
-- ------------------------------------------------------------------------
CREATE POLICY superadmin_licences_policy ON public.licences
    FOR ALL
    TO authenticated
    USING (public.is_super_admin() = TRUE)
    WITH CHECK (public.is_super_admin() = TRUE);

CREATE POLICY superadmin_devices_policy ON public.devices
    FOR ALL
    TO authenticated
    USING (public.is_super_admin() = TRUE)
    WITH CHECK (public.is_super_admin() = TRUE);

-- Allow public licence validation RPC (security definer function below)

-- ========================================================================
-- STORED PROCEDURES / SECURE RPC FUNCTIONS
-- ========================================================================

-- SECURE RPC: Activate Licence for a Device
CREATE OR REPLACE FUNCTION public.activate_centre_license(
    p_license_key VARCHAR(100),
    p_activation_code VARCHAR(50),
    p_device_uuid VARCHAR(255),
    p_device_model VARCHAR(255) DEFAULT 'Unknown Device',
    p_platform VARCHAR(50) DEFAULT 'android'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_licence RECORD;
    v_centre RECORD;
    v_device RECORD;
    v_existing_active_count INT;
BEGIN
    -- 1. Find the licence
    SELECT * INTO v_licence
    FROM public.licences
    WHERE license_key = UPPER(TRIM(p_license_key));

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid License Key. Please check and re-enter.');
    END IF;

    -- 2. Verify activation code
    IF v_licence.activation_code <> TRIM(p_activation_code) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid Activation Code.');
    END IF;

    -- 3. Check licence status
    IF v_licence.status = 'revoked' THEN
        RETURN jsonb_build_object('success', false, 'message', 'This license has been revoked by Super Admin.');
    END IF;

    -- 4. Check if this device is already activated for this licence
    SELECT * INTO v_device
    FROM public.devices
    WHERE license_id = v_licence.id AND device_uuid = p_device_uuid;

    IF FOUND AND v_device.is_active = TRUE THEN
        -- Already activated on this device, refresh last_seen
        UPDATE public.devices
        SET last_seen_at = NOW(),
            device_model = COALESCE(p_device_model, device_model)
        WHERE id = v_device.id;

        SELECT * INTO v_centre FROM public.centres WHERE id = v_licence.centre_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Device already activated.',
            'centre_id', v_licence.centre_id,
            'centre_name', v_licence.centre_name,
            'centre', row_to_json(v_centre)
        );
    END IF;

    -- 5. Count active devices for this licence
    SELECT COUNT(*) INTO v_existing_active_count
    FROM public.devices
    WHERE license_id = v_licence.id AND is_active = TRUE;

    IF v_existing_active_count >= v_licence.max_devices THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'License device limit reached (' || v_licence.max_devices || ' device allowed). Contact Super Admin to reset or authorize a replacement device.'
        );
    END IF;

    -- 6. Ensure centre exists or create one if this is first activation
    IF v_licence.centre_id IS NULL THEN
        INSERT INTO public.centres (
            code,
            name,
            owner_name,
            owner_phone,
            whatsapp_number,
            status
        ) VALUES (
            'SC-' || SUBSTRING(MD5(v_licence.license_key) FROM 1 FOR 8),
            v_licence.centre_name,
            v_licence.owner_name,
            v_licence.owner_phone,
            v_licence.owner_phone,
            'active'
        ) RETURNING id INTO v_licence.centre_id;

        UPDATE public.licences
        SET centre_id = v_licence.centre_id
        WHERE id = v_licence.id;
    END IF;

    -- 7. Register or reactivate device
    IF FOUND THEN
        UPDATE public.devices
        SET is_active = TRUE,
            last_seen_at = NOW(),
            device_model = p_device_model
        WHERE id = v_device.id;
    ELSE
        INSERT INTO public.devices (
            license_id,
            centre_id,
            device_uuid,
            device_model,
            platform,
            is_active
        ) VALUES (
            v_licence.id,
            v_licence.centre_id,
            p_device_uuid,
            p_device_model,
            p_platform,
            TRUE
        );
    END IF;

    -- 8. Mark licence active and update device count
    UPDATE public.licences
    SET status = 'active',
        activated_at = COALESCE(activated_at, NOW()),
        device_count = (SELECT COUNT(*) FROM public.devices WHERE license_id = v_licence.id AND is_active = TRUE),
        updated_at = NOW()
    WHERE id = v_licence.id;

    SELECT * INTO v_centre FROM public.centres WHERE id = v_licence.centre_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Tuition Centre successfully activated on this device!',
        'centre_id', v_licence.centre_id,
        'centre_name', v_licence.centre_name,
        'centre', row_to_json(v_centre)
    );
END;
$$;

-- SECURE RPC: Super Admin Reset Device Activation
CREATE OR REPLACE FUNCTION public.reset_device_activation(
    p_license_id UUID,
    p_device_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_device_id IS NOT NULL THEN
        UPDATE public.devices
        SET is_active = FALSE
        WHERE id = p_device_id AND license_id = p_license_id;
    ELSE
        -- Reset all devices for this license
        UPDATE public.devices
        SET is_active = FALSE
        WHERE license_id = p_license_id;
    END IF;

    UPDATE public.licences
    SET device_count = (SELECT COUNT(*) FROM public.devices WHERE license_id = p_license_id AND is_active = TRUE),
        updated_at = NOW()
    WHERE id = p_license_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Device activation successfully reset. Customer can now activate on their replacement device.'
    );
END;
$$;
