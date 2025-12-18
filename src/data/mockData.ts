// Mock data for CirclePe × Truliv Dashboard

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'advance';
export type DisbursementStatus = 'fully_disbursed' | 'partial';
export type RepaymentStatus = 'on_time' | 'overdue' | 'advance_paid';

export interface Disbursement {
  id: string;
  date: string;
  amount: number;
  utrNumber: string;
  type: '1st Tranche' | '2nd Tranche' | 'Final';
}

export interface Repayment {
  id: string;
  month: string;
  dueDate: string;
  rentAmount: number;
  paymentMode: 'Manual' | 'NACH';
  status: PaymentStatus;
  actualPaymentDate: string | null;
  amountPaid: number;
  isAdvance: boolean;
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyAddress: string;
  roomNumber: string;
  city: string;
  relationshipManager: string;
  rmContact: string;
  propertyManager: string;
  pmContact: string;
  leaseStartDate: string;
  leaseEndDate: string;
  lockInPeriod: number;
  monthlyRent: number;
  securityDeposit: number;
  totalAdvanceDisbursed: number;
  disbursementStatus: DisbursementStatus;
  repaymentStatus: RepaymentStatus;
  disbursements: Disbursement[];
  repayments: Repayment[];
}

export const residents: Resident[] = [
  {
    id: 'RES001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@email.com',
    phone: '+91 98765 43210',
    propertyName: 'Truliv Koramangala',
    propertyAddress: '45, 4th Block, Koramangala, Bangalore - 560034',
    roomNumber: 'A-204',
    city: 'Bangalore',
    relationshipManager: 'Priya Sharma',
    rmContact: '+91 99887 76655',
    propertyManager: 'Rajesh Kumar',
    pmContact: '+91 98765 12345',
    leaseStartDate: '2024-01-15',
    leaseEndDate: '2025-01-14',
    lockInPeriod: 6,
    monthlyRent: 25000,
    securityDeposit: 50000,
    totalAdvanceDisbursed: 300000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'on_time',
    disbursements: [
      { id: 'D001', date: '2024-01-10', amount: 150000, utrNumber: 'UTR2024011012345', type: '1st Tranche' },
      { id: 'D002', date: '2024-01-12', amount: 150000, utrNumber: 'UTR2024011254321', type: '2nd Tranche' },
    ],
    repayments: [
      { id: 'R001', month: 'February 2024', dueDate: '2024-02-05', rentAmount: 25000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-02-05', amountPaid: 25000, isAdvance: false },
      { id: 'R002', month: 'March 2024', dueDate: '2024-03-05', rentAmount: 25000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-04', amountPaid: 25000, isAdvance: false },
      { id: 'R003', month: 'April 2024', dueDate: '2024-04-05', rentAmount: 25000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-04-05', amountPaid: 25000, isAdvance: false },
      { id: 'R004', month: 'May 2024', dueDate: '2024-05-05', rentAmount: 25000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-05-03', amountPaid: 25000, isAdvance: true },
    ],
  },
  {
    id: 'RES002',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    phone: '+91 87654 32109',
    propertyName: 'Truliv HSR Layout',
    propertyAddress: '78, Sector 2, HSR Layout, Bangalore - 560102',
    roomNumber: 'B-102',
    city: 'Bangalore',
    relationshipManager: 'Amit Verma',
    rmContact: '+91 98876 54321',
    propertyManager: 'Sunita Devi',
    pmContact: '+91 99988 77665',
    leaseStartDate: '2024-02-01',
    leaseEndDate: '2025-01-31',
    lockInPeriod: 6,
    monthlyRent: 22000,
    securityDeposit: 44000,
    totalAdvanceDisbursed: 264000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'overdue',
    disbursements: [
      { id: 'D003', date: '2024-01-28', amount: 264000, utrNumber: 'UTR2024012898765', type: '1st Tranche' },
    ],
    repayments: [
      { id: 'R005', month: 'March 2024', dueDate: '2024-03-05', rentAmount: 22000, paymentMode: 'Manual', status: 'paid', actualPaymentDate: '2024-03-08', amountPaid: 22000, isAdvance: false },
      { id: 'R006', month: 'April 2024', dueDate: '2024-04-05', rentAmount: 22000, paymentMode: 'Manual', status: 'paid', actualPaymentDate: '2024-04-12', amountPaid: 22000, isAdvance: false },
      { id: 'R007', month: 'May 2024', dueDate: '2024-05-05', rentAmount: 22000, paymentMode: 'Manual', status: 'failed', actualPaymentDate: null, amountPaid: 0, isAdvance: false },
    ],
  },
  {
    id: 'RES003',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 76543 21098',
    propertyName: 'Truliv Indiranagar',
    propertyAddress: '23, 12th Main, Indiranagar, Bangalore - 560038',
    roomNumber: 'C-305',
    city: 'Bangalore',
    relationshipManager: 'Priya Sharma',
    rmContact: '+91 99887 76655',
    propertyManager: 'Mohan Rao',
    pmContact: '+91 88776 65544',
    leaseStartDate: '2024-03-01',
    leaseEndDate: '2025-02-28',
    lockInPeriod: 11,
    monthlyRent: 35000,
    securityDeposit: 70000,
    totalAdvanceDisbursed: 420000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'advance_paid',
    disbursements: [
      { id: 'D004', date: '2024-02-25', amount: 210000, utrNumber: 'UTR2024022543210', type: '1st Tranche' },
      { id: 'D005', date: '2024-02-27', amount: 210000, utrNumber: 'UTR2024022754321', type: '2nd Tranche' },
    ],
    repayments: [
      { id: 'R008', month: 'April 2024', dueDate: '2024-04-05', rentAmount: 35000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-04-01', amountPaid: 35000, isAdvance: true },
      { id: 'R009', month: 'May 2024', dueDate: '2024-05-05', rentAmount: 35000, paymentMode: 'NACH', status: 'advance', actualPaymentDate: '2024-04-20', amountPaid: 70000, isAdvance: true },
    ],
  },
  {
    id: 'RES004',
    name: 'Neha Patel',
    email: 'neha.patel@email.com',
    phone: '+91 65432 10987',
    propertyName: 'Truliv Whitefield',
    propertyAddress: '56, ITPL Main Road, Whitefield, Bangalore - 560066',
    roomNumber: 'D-401',
    city: 'Bangalore',
    relationshipManager: 'Amit Verma',
    rmContact: '+91 98876 54321',
    propertyManager: 'Lakshmi Narayanan',
    pmContact: '+91 77665 54433',
    leaseStartDate: '2024-01-01',
    leaseEndDate: '2024-12-31',
    lockInPeriod: 6,
    monthlyRent: 28000,
    securityDeposit: 56000,
    totalAdvanceDisbursed: 168000,
    disbursementStatus: 'partial',
    repaymentStatus: 'on_time',
    disbursements: [
      { id: 'D006', date: '2023-12-28', amount: 168000, utrNumber: 'UTR2023122876543', type: '1st Tranche' },
    ],
    repayments: [
      { id: 'R010', month: 'February 2024', dueDate: '2024-02-05', rentAmount: 28000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-02-05', amountPaid: 28000, isAdvance: false },
      { id: 'R011', month: 'March 2024', dueDate: '2024-03-05', rentAmount: 28000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-05', amountPaid: 28000, isAdvance: false },
      { id: 'R012', month: 'April 2024', dueDate: '2024-04-05', rentAmount: 28000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-04-05', amountPaid: 28000, isAdvance: false },
      { id: 'R013', month: 'May 2024', dueDate: '2024-05-05', rentAmount: 28000, paymentMode: 'NACH', status: 'pending', actualPaymentDate: null, amountPaid: 0, isAdvance: false },
    ],
  },
  {
    id: 'RES005',
    name: 'Rahul Gupta',
    email: 'rahul.gupta@email.com',
    phone: '+91 54321 09876',
    propertyName: 'Truliv Powai',
    propertyAddress: '12, Hiranandani Gardens, Powai, Mumbai - 400076',
    roomNumber: 'E-201',
    city: 'Mumbai',
    relationshipManager: 'Deepak Joshi',
    rmContact: '+91 99112 23344',
    propertyManager: 'Anita Deshmukh',
    pmContact: '+91 88221 13344',
    leaseStartDate: '2024-02-15',
    leaseEndDate: '2025-02-14',
    lockInPeriod: 6,
    monthlyRent: 32000,
    securityDeposit: 64000,
    totalAdvanceDisbursed: 384000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'on_time',
    disbursements: [
      { id: 'D007', date: '2024-02-10', amount: 192000, utrNumber: 'UTR2024021087654', type: '1st Tranche' },
      { id: 'D008', date: '2024-02-12', amount: 192000, utrNumber: 'UTR2024021298765', type: 'Final' },
    ],
    repayments: [
      { id: 'R014', month: 'March 2024', dueDate: '2024-03-15', rentAmount: 32000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-15', amountPaid: 32000, isAdvance: false },
      { id: 'R015', month: 'April 2024', dueDate: '2024-04-15', rentAmount: 32000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-04-15', amountPaid: 32000, isAdvance: false },
      { id: 'R016', month: 'May 2024', dueDate: '2024-05-15', rentAmount: 32000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-05-14', amountPaid: 32000, isAdvance: false },
    ],
  },
  {
    id: 'RES006',
    name: 'Kavya Nair',
    email: 'kavya.nair@email.com',
    phone: '+91 43210 98765',
    propertyName: 'Truliv Andheri',
    propertyAddress: '89, Lokhandwala Complex, Andheri West, Mumbai - 400053',
    roomNumber: 'F-103',
    city: 'Mumbai',
    relationshipManager: 'Deepak Joshi',
    rmContact: '+91 99112 23344',
    propertyManager: 'Vinod Sharma',
    pmContact: '+91 77332 21100',
    leaseStartDate: '2024-03-10',
    leaseEndDate: '2025-03-09',
    lockInPeriod: 6,
    monthlyRent: 27000,
    securityDeposit: 54000,
    totalAdvanceDisbursed: 324000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'overdue',
    disbursements: [
      { id: 'D009', date: '2024-03-05', amount: 324000, utrNumber: 'UTR2024030521098', type: '1st Tranche' },
    ],
    repayments: [
      { id: 'R017', month: 'April 2024', dueDate: '2024-04-10', rentAmount: 27000, paymentMode: 'Manual', status: 'paid', actualPaymentDate: '2024-04-15', amountPaid: 27000, isAdvance: false },
      { id: 'R018', month: 'May 2024', dueDate: '2024-05-10', rentAmount: 27000, paymentMode: 'Manual', status: 'failed', actualPaymentDate: null, amountPaid: 0, isAdvance: false },
    ],
  },
  {
    id: 'RES007',
    name: 'Aditya Jain',
    email: 'aditya.jain@email.com',
    phone: '+91 32109 87654',
    propertyName: 'Truliv Gurgaon',
    propertyAddress: '34, Cyber City, DLF Phase 2, Gurgaon - 122002',
    roomNumber: 'G-502',
    city: 'Gurgaon',
    relationshipManager: 'Meera Kapoor',
    rmContact: '+91 98443 32211',
    propertyManager: 'Suresh Yadav',
    pmContact: '+91 99554 43322',
    leaseStartDate: '2024-01-20',
    leaseEndDate: '2025-01-19',
    lockInPeriod: 6,
    monthlyRent: 30000,
    securityDeposit: 60000,
    totalAdvanceDisbursed: 360000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'on_time',
    disbursements: [
      { id: 'D010', date: '2024-01-15', amount: 180000, utrNumber: 'UTR2024011532109', type: '1st Tranche' },
      { id: 'D011', date: '2024-01-18', amount: 180000, utrNumber: 'UTR2024011843210', type: '2nd Tranche' },
    ],
    repayments: [
      { id: 'R019', month: 'February 2024', dueDate: '2024-02-20', rentAmount: 30000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-02-20', amountPaid: 30000, isAdvance: false },
      { id: 'R020', month: 'March 2024', dueDate: '2024-03-20', rentAmount: 30000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-20', amountPaid: 30000, isAdvance: false },
      { id: 'R021', month: 'April 2024', dueDate: '2024-04-20', rentAmount: 30000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-04-20', amountPaid: 30000, isAdvance: false },
      { id: 'R022', month: 'May 2024', dueDate: '2024-05-20', rentAmount: 30000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-05-18', amountPaid: 30000, isAdvance: false },
    ],
  },
  {
    id: 'RES008',
    name: 'Priyanka Chopra',
    email: 'priyanka.c@email.com',
    phone: '+91 21098 76543',
    propertyName: 'Truliv Noida',
    propertyAddress: '67, Sector 62, Noida - 201301',
    roomNumber: 'H-304',
    city: 'Noida',
    relationshipManager: 'Meera Kapoor',
    rmContact: '+91 98443 32211',
    propertyManager: 'Rakesh Gupta',
    pmContact: '+91 88665 54433',
    leaseStartDate: '2024-02-05',
    leaseEndDate: '2025-02-04',
    lockInPeriod: 6,
    monthlyRent: 24000,
    securityDeposit: 48000,
    totalAdvanceDisbursed: 288000,
    disbursementStatus: 'fully_disbursed',
    repaymentStatus: 'advance_paid',
    disbursements: [
      { id: 'D012', date: '2024-02-01', amount: 288000, utrNumber: 'UTR2024020121098', type: '1st Tranche' },
    ],
    repayments: [
      { id: 'R023', month: 'March 2024', dueDate: '2024-03-05', rentAmount: 24000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-01', amountPaid: 24000, isAdvance: true },
      { id: 'R024', month: 'April 2024', dueDate: '2024-04-05', rentAmount: 24000, paymentMode: 'NACH', status: 'paid', actualPaymentDate: '2024-03-28', amountPaid: 24000, isAdvance: true },
      { id: 'R025', month: 'May 2024', dueDate: '2024-05-05', rentAmount: 24000, paymentMode: 'NACH', status: 'advance', actualPaymentDate: '2024-04-25', amountPaid: 48000, isAdvance: true },
    ],
  },
];

// Summary statistics
export const getSummaryStats = () => {
  const totalDisbursed = residents.reduce((sum, r) => sum + r.totalAdvanceDisbursed, 0);
  const totalCollected = residents.reduce((sum, r) => 
    sum + r.repayments.filter(p => p.status === 'paid' || p.status === 'advance').reduce((s, p) => s + p.amountPaid, 0), 0
  );
  const totalOutstanding = residents.reduce((sum, r) => 
    sum + r.repayments.filter(p => p.status === 'pending' || p.status === 'failed').reduce((s, p) => s + p.rentAmount, 0), 0
  );
  const overdueCount = residents.filter(r => r.repaymentStatus === 'overdue').length;
  const advanceCount = residents.filter(r => r.repaymentStatus === 'advance_paid').length;
  const activeCount = residents.filter(r => new Date(r.leaseEndDate) >= new Date()).length;
  const inactiveCount = residents.length - activeCount;
  
  return {
    totalDisbursed,
    totalCollected,
    totalOutstanding,
    totalResidents: residents.length,
    overdueCount,
    advanceCount,
    onTimeCount: residents.length - overdueCount - advanceCount,
    activeCount,
    inactiveCount,
  };
};

export const cities = [...new Set(residents.map(r => r.city))];
export const properties = [...new Set(residents.map(r => r.propertyName))];
