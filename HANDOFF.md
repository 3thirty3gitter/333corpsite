# Pilot Suite 2025 - Development Handoff Document

**Last Updated:** January 6, 2026  
**Branch:** `main`  
**Status:** Feature Complete - SinaLite & Catalog Enhancements  
**Production URL:** https://www.3thirty3group.ca

---

## 🎯 Current Session Summary (January 6, 2026)

### What Was Accomplished

#### Catalog Enhancements & SinaLite Order Flow
Finalized the main supplier integration features for SinaLite:

1. **Multi-Criteria Catalog Sorting**
   - Added sorting by Newest, Oldest, Name (A-Z/Z-A), and Price (Low/High).
   - Integrated logic into the `useMemo` filter chain for high performance.
   - Added a modern Select UI control with icons in the catalog filter bar.

2. **SinaLite Pricing & Shipping Calculator**
   - Added a dedicated shipping estimation API (`/api/suppliers/sinalite/shipping`).
   - Integrated real-time shipping lookups into the product detail modal.
   - Users can now see instant shipping rates by entering their Zip/State/Country.
   - Defaulted shipping to Markham, ON for quick estimates.

3. **SinaLite Order Flow Backend**
   - Implemented the order placement API (`/api/suppliers/sinalite/order`).
   - Supports multi-item orders, file attachments (print PDFs), and full shipping/billing address pass-through.
   - Secured with `requireAdmin` to prevent unauthorized order placement.

4. **Product Edit & Management**
   - Completed the Product Edit page with image upload support to Supabase Storage.
   - Implemented dynamic category-based placeholders for SinaLite products.
   - Enabled bulk selection and import for SinaLite products.

#### Key Files Modified
- [src/app/dashboard/catalog/page.tsx](src/app/dashboard/catalog/page.tsx) - Sorting UI/Logic.
- [src/components/suppliers/sinalite-pricing-calculator.tsx](src/components/suppliers/sinalite-pricing-calculator.tsx) - Shipping integration.
- [src/app/api/suppliers/sinalite/shipping/route.ts](src/app/api/suppliers/sinalite/shipping/route.ts) - New Endpoint.
- [src/app/api/suppliers/sinalite/order/route.ts](src/app/api/suppliers/sinalite/order/route.ts) - New Endpoint.

---

## 🎯 Previous Session Summary (December 31, 2025)

### What Was Accomplished

#### SinaLite Integration - COMPLETE ✅
Successfully integrated SinaLite print product supplier with full import functionality:

1. **Import Route Fixed** (`/api/suppliers/sinalite/import`)
   - Added proper admin authentication with `requireAdmin()`
   - Fixed `user_id` NOT NULL constraint (same issue as Momentec)
   - Added required `price` field to product data
   - Correct API response parsing (array of [options, pricing, metadata])
   - Improved error handling with detailed error messages

2. **Product Data Enhancement**
   - Rich descriptions with product name, category, SKU
   - All options captured (size, qty, Stock, Coating, Round Corners, Turnaround)
   - Price range calculation from variants
   - Options grouped by type for easy display
   - Variants stored (limited to 100 for performance)

3. **API Configuration**
   - Sandbox URL: `https://api.sinaliteuppy.com`
   - Live URL: `https://liveapi.sinalite.com`
   - Store codes: 6 = Canada, 9 = US
   - OAuth2 authentication (optional for product list)

#### Key Files Modified
- [src/app/api/suppliers/sinalite/import/route.ts](src/app/api/suppliers/sinalite/import/route.ts) - Complete rewrite
- [src/app/api/suppliers/sinalite/auth.ts](src/app/api/suppliers/sinalite/auth.ts) - Fixed to use getSupabaseAdmin()
- [src/app/api/suppliers/sinalite/products/route.ts](src/app/api/suppliers/sinalite/products/route.ts) - Made auth optional

#### Previous Session Work (Still Relevant)
- **Momentec Integration** - Complete with image display working
- **Image URL extraction** - Fixed JSON parsing for proper image display
- **Catalog page** - Shows products from all suppliers with proper badges

---

## ⚠️ Known Limitations

### SinaLite API
- **No product images** - The SinaLite Pricing API is pricing-focused only
- Images must be added manually after import or scraped from sinalite.com (future enhancement)
- Metadata array is often empty

### Products Table Schema
- `user_id` is required (NOT NULL) - all inserts must include it
- `price` is required (NOT NULL) - set to minimum variant price
- `source` and `source_id` used for deduplication

---

## 🚀 Next Steps for Future Sessions

### High Priority

1. **SinaLite Image Support**
   - Option A: Manual upload UI on product edit page
   - Option B: Scrape images from [sinalite.com](https://www.sinalite.com) product pages
   - Option C: Use placeholder images by category (Business Cards, Flyers, etc.)

2. **Product Edit Page**
   - Create `/dashboard/products/[id]/edit` page
   - Allow editing name, description, images
   - Image upload to Supabase Storage

3. **Bulk Import**
   - UI to import multiple SinaLite products at once
   - Progress indicator for bulk operations
   - Error summary after bulk import

### Medium Priority

4. **Product Catalog Enhancements**
   - Filter by supplier (Momentec, SinaLite)
   - Filter by category
   - Search functionality
   - Sort by price, name, date added

5. **Pricing Calculator**
   - Use SinaLite `/price/{id}/{storeCode}` endpoint
   - Interactive option selection
   - Real-time price calculation

6. **Order Integration**
   - SinaLite `/order/new` endpoint
   - Shipping estimates via `/order/shippingEstimate`
   - Order tracking

### Low Priority

7. **Additional Supplier Integrations**
   - 4over
   - PrintingForLess
   - Other print suppliers

8. **Analytics**
   - Product view tracking
   - Import history
   - Popular products dashboard

---

## 🔧 Technical Reference

### Supplier Integration Pattern

All supplier integrations follow this pattern:

```typescript
// /api/suppliers/{supplier}/import/route.ts
export async function POST(request: NextRequest) {
  // 1. Authenticate admin
  const identity = await requireAdmin(request);
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Parse product IDs from request
  const { productId } = await request.json();

  // 3. Fetch from supplier API
  const response = await fetch(`${supplierApi}/product/${productId}`);
  
  // 4. Transform to our schema
  const productData = {
    name: ...,
    description: ...,
    price: ...,           // Required
    user_id: identity.userId,  // Required
    source: 'supplier_name',
    source_id: String(productId),
    // ... other fields
  };

  // 5. Upsert to database
  const { data, error } = await admin
    .from('products')
    .upsert(productData, { onConflict: 'source,source_id' });
}
```

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# SinaLite (stored in supplier_credentials table)
# - client_id
# - client_secret  
# - base_url (sandbox or live)
# - store_code (6 for Canada, 9 for US)
```

### SinaLite API Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/product` | GET | Optional | List all products |
| `/product/{id}` | GET | Optional | Get single product |
| `/product/{id}/{storeCode}` | GET | Required | Get options + pricing |
| `/variants/{id}/{offset}` | GET | Required | Get price variants |
| `/price/{id}/{storeCode}` | POST | Required | Calculate price |
| `/order/new` | POST | Required | Create order |

---

## 🐛 Common Issues & Solutions

### "null value in column 'price'" Error
- Cause: Missing `price` field in product insert
- Solution: Set `price: minPrice > 0 ? minPrice : 0`

### "null value in column 'user_id'" Error
- Cause: Missing `user_id` in product insert
- Solution: Get from `identity.userId` after `requireAdmin()`

### Import Returns "Unknown error"
- Cause: Supabase error not being captured properly
- Solution: Check for `error.message || error.code || error.details`

### No Vercel Logs Appearing
- Check: Is the route file named `route.ts` (not `route.tsx`)?
- Check: Is the function exported as `POST` or `GET`?
- Test: Create simple test endpoint to verify logging works

---

## 📊 Current Database State

### Products Table
- 2 Momentec products (with images)
- 1+ SinaLite products (no images, rich descriptions)

### Supplier Credentials Table
- `momentec` - API key configured
- `sinalite` - OAuth2 credentials configured

---

## 📋 Project Overview

Pilot Suite is a comprehensive employee portal built with Next.js 15, TypeScript, and Supabase. The platform provides employees with access to training materials, company documents, product information, and administrative tools.

### Tech Stack
- **Framework:** Next.js 15.0.3 with App Router
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Password + Magic Links)
- **UI Components:** shadcn/ui + Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel
- **Charts:** Recharts

---

## 🔐 Authentication & Authorization

### Authentication Methods
1. **Email + Password** - Traditional login
2. **Magic Links** - Passwordless email authentication

### User Roles
- **Employee** - Standard access to resources, training, documents
- **Admin** - Full access including user management, billing, team management

### Admin Privileges
- Determined by `@3thirty3.com` email domain
- Admin role stored in `employees` table
- Access to restricted pages: Products, Billing, Team, Analytics
- User management capabilities in Settings

### Key Files
- `/src/hooks/use-supabase-auth.tsx` - Auth state management hook
- `/src/components/auth/SignInForm.tsx` - Login form component
- `/src/app/auth/signin/page.tsx` - Sign-in page
- `/src/app/dashboard/layout.tsx` - Protected route wrapper

---

## 🗄️ Database Schema

### Core Tables
- `employees`: User roles and profiles
- `notifications`: System notifications for users
- `knowledge_base_articles`: Articles for the help center
- `training_modules`: Training content
- `user_training_progress`: Tracking user progress
- `documents`: Company documents
- `quick_links`: External tool links
- `products`: Product catalog

### Row Level Security (RLS)
- Enabled on all tables
- Policies enforce read access for authenticated users
- Write access restricted to admin operations via service role key

---

## 🚀 Key Features Implemented

### 1. Dashboard Homepage (`/dashboard`)
- **Stats Cards:** 4 key metrics with icons
- **Quick Access Tools:** Links to main sections
- **Resource Cards:** Featured resources and tools
- **Status:** ✅ Complete

### 2. Knowledge Base (`/dashboard/knowledge-base`)
- **Search Functionality:** Filter articles by keyword
- **Categories:** Getting Started, Products, Tools, Policies, Technical
- **6 Sample Articles:** Each with view count and helpful metrics
- **Popular Topics:** Badge-style quick links
- **Status:** ✅ Complete

### 3. Training Center (`/dashboard/training`)
- **Learning Stats:** Cards showing progress metrics
- **3-Tab Interface:**
  - Onboarding modules with progress tracking
  - Available courses with skill level badges
  - Certifications (earned and in-progress)
- **Status:** ✅ Complete

### 4. Company Documents (`/dashboard/documents`)
- **Search & Filter:** By document name and category
- **5 Categories:** Policies, Forms, Handbooks, Templates, Legal
- **Document Library:** 10 sample documents
- **Important Documents:** Featured section
- **Recently Viewed:** Sidebar with quick access
- **Status:** ✅ Complete

### 5. Quick Links (`/dashboard/quick-links`)
- **12 External Tools:** Grid layout with emojis
- **SSO Indicators:** Badge showing SSO availability
- **Favorites:** Star system for bookmarking
- **Categories:** Productivity, Communication, Design, Development
- **Status:** ✅ Complete

### 6. User Profile (`/dashboard/profile`)
- **3-Tab Interface:**
  - Overview: Avatar, email, role, member since, last login
  - Edit Profile: Update full name
  - Activity: Recent account activity timeline
- **Status:** ✅ Complete

### 7. Settings (`/dashboard/settings`)
- **Profile Tab:** Update display name
- **Account Info Tab:** View email, role, account dates
- **Security Tab:** Session info, 2FA placeholder
- **Users Tab (Admin Only):** Employee management
  - Add new employees with email and role (Dialog UI)
  - View all employees with avatars and badges
  - Delete employees with confirmation
- **Status:** ✅ Complete

### 8. Authentication System
- **Modern Sign-in Page:** Gradient background, centered card layout
- **Dual Auth Modes:** Toggle between password and magic link
- **Password Toggle:** Show/hide password visibility
- **Remember Me:** Checkbox for persistent sessions
- **Logout:** Proper session cleanup with router refresh
- **Status:** ✅ Complete

### 9. Notifications System
- **Real-time Updates:** Uses Supabase Realtime
- **UI:** Bell icon in header with unread badge
- **Features:** Mark as read, view all, empty state
- **Status:** ✅ Complete

### 10. Analytics Dashboard (`/dashboard/analytics`)
- **Visualizations:** Charts using Recharts
- **Metrics:** User growth, active users, training completion, document views
- **Status:** ✅ Complete

---

## 🔧 API Endpoints

### `/api/supabase/employees` (GET)
- **Purpose:** Fetch all employees
- **Auth:** Required (JWT in Authorization header)
- **Returns:** Array of employee objects

### `/api/supabase/employees` (POST)
- **Purpose:** Create new employee
- **Auth:** Required (Admin role)
- **Body:** `{ email: string, role: 'Employee' | 'Admin' }`
- **Returns:** Created employee object

### `/api/supabase/employees` (DELETE)
- **Purpose:** Remove employee by ID
- **Auth:** Required (Admin role)
- **Body:** `{ id: string }`
- **Returns:** Success confirmation

### `/api/supabase/health` (GET)
- **Purpose:** Check Supabase connection
- **Auth:** None
- **Returns:** Connection status

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── supabase/
│   │       ├── employees/route.ts    # Employee CRUD operations
│   │       └── health/route.ts       # Health check
│   ├── auth/
│   │   └── signin/page.tsx           # Login page
│   └── dashboard/
│       ├── layout.tsx                # Protected dashboard wrapper
│       ├── page.tsx                  # Dashboard homepage
│       ├── analytics/page.tsx        # Analytics dashboard
│       ├── billing/page.tsx          # Billing management (admin)
│       ├── catalog/page.tsx          # Product catalog
│       ├── documents/page.tsx        # Company documents library
│       ├── knowledge-base/page.tsx   # Help center
│       ├── products/page.tsx         # Product management (admin)
│       ├── profile/page.tsx          # User profile
│       ├── quick-links/page.tsx      # External tools directory
│       ├── resources/page.tsx        # Resources hub
│       ├── settings/page.tsx         # Settings & user management
│       ├── team/page.tsx             # Team management (admin)
│       └── training/page.tsx         # Training center
├── components/
│   ├── auth/
│   │   └── SignInForm.tsx            # Authentication form
│   ├── landing/                      # Landing page components
│   ├── notifications-bell.tsx        # Notification component
│   └── ui/                           # shadcn/ui components
├── hooks/
│   ├── use-supabase-auth.tsx         # Auth state hook
│   └── use-require-admin.tsx         # Admin authorization hook
└── lib/
    ├── supabase.ts                   # Supabase client
    └── utils.ts                      # Utility functions
```

---

## 🛠️ Admin Scripts

### `/scripts/make-me-admin.sh`
**Purpose:** Assign admin role to any email address  
**Usage:**
```bash
./scripts/make-me-admin.sh email@example.com
```
**Requirements:** 
- `SUPABASE_URL` in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Executable permissions: `chmod +x scripts/make-me-admin.sh`

---

## 🔑 Environment Variables

### Required in `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
MASTER_ADMIN_SECRET=[secret-password]
```

### Security Notes
- Service role key bypasses RLS - use carefully
- Never expose service role key in client-side code
- Master admin secret used for super-admin operations
- Anon key is safe for client-side use

---

## 🚦 Navigation Structure

### Sidebar Menu
- **Home** - Landing page
- **Dashboard** - Employee portal homepage
- **Resources** - Resource hub
- **Catalog** - Product catalog
- **Analytics** - Admin analytics

**Admin Only:**
- **Products** - Product management
- **Billing** - Subscription management
- **Team** - Team member management

**Tools:**
- **PrintPilot** - (Coming soon)
- **StickerPilot** - (Coming soon)
- **TimePilot** - (Coming soon)

### Footer Actions
- **Settings Button** → `/dashboard/settings` (App settings, user management)
- **User Avatar** → `/dashboard/profile` (Personal profile info)
- **Support** - Help & support
- **Log out** - Sign out with session cleanup

---

## ✅ Testing Checklist

### Authentication
- [ ] Sign in with email + password
- [ ] Sign in with magic link
- [ ] Password visibility toggle works
- [ ] Remember me persists session
- [ ] Logout clears session and redirects
- [ ] Protected routes redirect to signin when not authenticated

### User Profile
- [ ] Avatar displays correctly
- [ ] Clicking avatar opens profile page
- [ ] Full name can be updated
- [ ] Email verification status shows correctly
- [ ] Role badge displays (Employee/Admin)
- [ ] Account dates format correctly
- [ ] Activity timeline shows events

### Settings (All Users)
- [ ] Profile tab allows name updates
- [ ] Account info displays all details
- [ ] Security tab shows session info
- [ ] Settings button in sidebar works

### Settings (Admin Only)
- [ ] Users tab appears for @3thirty3.com emails
- [ ] Add Employee button opens dialog
- [ ] New employees appear in list immediately
- [ ] Employee cards show avatar, email, date, role
- [ ] Delete employee shows confirmation
- [ ] Delete removes employee and refreshes list

### Dashboard Pages
- [ ] Knowledge Base search filters articles
- [ ] Training modules show progress bars
- [ ] Documents can be filtered by category
- [ ] Quick Links display with SSO badges
- [ ] All navigation links work
- [ ] Analytics page loads charts

### Admin Features
- [ ] Products page accessible only to admins
- [ ] Billing page accessible only to admins
- [ ] Team page accessible only to admins
- [ ] Non-admin users don't see admin menu items

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No Real Data:** All content uses placeholder/sample data
2. **No Search Implementation:** Search bars are UI-only, no backend
3. **No File Upload:** Document library shows static documents
4. **No Real SSO:** Quick Links SSO badges are hardcoded
5. **No 2FA:** Security tab shows "Coming Soon" for 2FA

### Placeholder Features
- Training progress is hardcoded at 75%
- Document view counts are static
- Certification expiration dates are sample data
- Learning stats are mock data

---

## 🔄 Next Steps & Recommendations

### High Priority
1. **Test Employee Onboarding Flow**
   - Add test employee via Users tab
   - Send login credentials
   - Verify they can access appropriate resources

2. **Real Search Implementation**
   - Add full-text search to knowledge base
   - Implement document search with filters
   - Add global search in header

3. **File Upload System**
   - Supabase Storage integration
   - Document upload for admins
   - Profile avatar upload
   - File versioning for documents

### Medium Priority
4. **SSO Integration**
   - OAuth providers (Google, Microsoft)
   - SAML for enterprise apps
   - Single sign-on for external tools

5. **Advanced Features**
   - Training completion tracking
   - Certification reminders
   - Document approval workflows
   - Team collaboration tools

---

## 📞 Support & Contacts

### Current Admin User
- **Email:** trent@3thirty3.ca
- **Role:** Admin
- **Access:** Full system access

### Repository
- **GitHub:** https://github.com/trenttimmerman/pilotsuite2025
- **Branch:** preview/supabase-setup
- **Pull Request:** #1 - feat(supabase): Add auth, master admin, employees, and team management

### Development Environment
- **Platform:** VS Code in Dev Container (Ubuntu 24.04.3 LTS)
- **Node Version:** (Check with `node --version`)
- **Package Manager:** npm

---

## 🚀 Deployment Instructions

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Deployment (Vercel)
```bash
# Already deployed at:
# https://pilotsuite2025-git-preview-supabase-setup-333-production2025.vercel.app

# To redeploy:
git push origin preview/supabase-setup

# Vercel will automatically rebuild
```

### Database Migrations
```bash
# Run Supabase migrations
cd supabase
supabase db push

# Migrations located in:
# - supabase/migrations/001_create_pilot_test_table.sql
# - supabase/migrations/002_create_employees_table.sql
# - supabase/migrations/003_add_rls_policies.sql
# - supabase/migrations/004_create_core_tables.sql
```

---

## 📝 Code Standards & Conventions

### TypeScript
- Strict mode enabled
- Explicit return types preferred
- Interface over type for objects

### React Components
- Use 'use client' directive for client components
- Functional components with hooks
- Props destructuring
- Component files use PascalCase

### Styling
- Tailwind CSS utility classes
- shadcn/ui for base components
- Responsive design (mobile-first)
- Dark mode support via CSS variables

### API Routes
- RESTful conventions
- Proper HTTP status codes
- JWT authentication via Authorization header
- Error handling with try-catch

---

## 📚 Documentation References

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## ✨ Summary

The Pilot Suite platform is production-ready for initial testing with core features complete:
- ✅ Authentication system with dual auth modes
- ✅ User profile and settings management
- ✅ Admin user management capabilities
- ✅ Knowledge base, training center, and document library
- ✅ Protected routes with role-based access
- ✅ Modern, responsive UI with shadcn components
- ✅ Real-time notifications
- ✅ Analytics dashboard

**Ready for:** User testing, feedback collection, and iterative feature development  
**Not ready for:** Production launch with real users (needs real data integration)

---

*Document prepared by GitHub Copilot on November 18, 2025*
