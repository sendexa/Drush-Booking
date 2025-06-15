
### ✅ `context.md`

````md
# D-Rush Lodge Booking Platform — Context File

## 🧠 Project Summary

A lightweight, user-focused hotel booking platform for D-Rush Lodge, deployed at **booking.drushlodge.com**, built with:
- **Next.js (App Router)**
- **Tailwind CSS**
- **Firebase Auth & Firestore**
- **Vercel (or Netlify) Hosting**

Guests can create an account, make room bookings, and view their booking history in a modern, mobile-first UI.

---

## 🌐 Project URL Structure

| Path                      | Purpose                                  |
|---------------------------|------------------------------------------|
| `/`                       | Dashboard / landing (optional stats)     |
| `/book`                  | Room selection + booking flow            |
| `/my-bookings`           | Booking history for the logged-in user   |
| `/settings/profile`      | View/update personal info                |
| `/settings/security`     | Change password                          |
| `/login` & `/signup`     | Auth pages                               |
| `/logout`                | Sign out and clear session               |

---

## 🧭 Navigation Structure

Defined in `navItems.ts`:
- Dashboard
- Bookings
  - Book a Room
  - My Bookings
- Settings
  - Profile
  - Change Password
- Logout

---

## 🔐 Authentication

- Firebase Auth (Email + Password)
- Auth context stored in React Context + `useAuth` hook
- Protected routes using middleware or layout check

---

## 🧱 Booking Data Structure (Firestore)

```ts
type Booking = {
  id: string;
  userId: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
};
````

---

## 👤 User Data Structure

```ts
type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt: string;
};
```

---

## 🖼️ UI Stack

* **Next.js App Router** (project in `/app`)
* **Tailwind CSS** for styling
* `lucide-react` for icons
* Responsive sidebar layout
* Mobile-friendly form pages
* SweetAlert or Toast for notifications

---

## 🧪 Features (MVP)

* [x] User Registration & Login
* [x] Booking Form with Validation
* [x] Booking Confirmation Screen
* [x] Booking History Page
* [x] Profile Page
* [x] Password Update
* [x] Logout Function
* [ ] Booking email notification (optional)
* [ ] Admin panel (v2, optional)

---

## 🔌 Integrations

| Tool            | Purpose               |
| --------------- | --------------------- |
| Firebase        | Auth + Firestore DB   |
| Vercel          | Hosting               |
| Google Fonts    | Typography (optional) |
| React Hook Form | Form handling         |

---

## 🔄 Future Ideas

* Admin Panel for staff
* Room availability calendar
* Payment integration (Paystack or Sendexa)
* Booking cancellation policy
* Booking confirmation via email/SMS

---

## 📁 Folder Structure (Recommended)

```
/app
  /book
  /my-bookings
  /settings
    /profile
    /security
  /login
  /signup
  /logout
/components
  Sidebar.tsx
  Navbar.tsx
  BookingForm.tsx
  BookingCard.tsx
  Layout.tsx
/context
  AuthContext.tsx
  BookingContext.tsx
/utils
  firebase.ts
  formatDate.ts
```

---

## 🧠 Dev Notes

* Focus on **guest experience**
* Minimize external dependencies
* Deploy fast, iterate later
* Use dummy rooms data for now
* Use Firestore to store bookings
* Auto-create user profile on signup

---

## 🏁 MVP Launch Goal

Basic booking system live at:
🔗 `booking.drushlodge.com`

