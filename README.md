# Church App

A Progressive Web App (PWA) built for [Your Church Name], giving members
access to church content, services, and community features — with
individual paid membership access, approved by an admin.

## Access Model
- Members register individually and pay a monthly fee through the app.
- After payment, the admin manually approves access before the member can log in.
- If a member's subscription lapses, access is blocked until renewed.

## Roles
- **Member** — regular app users, once approved.
- **Admin** — separate login. Can post announcements, updates, and daily
  devotions, manage attendance, and approve/reject member payments.

## App Structure (Member-Facing)
- **Home** — Announcements + weekly/monthly service updates
- **Sermons** — Sermon archive (title, date, speaker, written notes)
- **Bible** — Daily devotion (scheduled scripture) + full offline Bible reader
  (browse any book/chapter/verse, works without internet)
- **Community** — Photo gallery (downloadable photos) + prayer request wall
- **Live** — Link to live stream during services
- **My Account** — Personal attendance status, profile, payment status

## Admin Dashboard (Admin-Only)
- Approve/reject member payments
- Mark attendance, and manually add/remove members from records
- Post announcements, service updates, and daily devotions
- View attendance follow-up list (members not marked present, with contact info)

## Additional Features
- Birthday notifications (church-wide, by name)
- Push notifications (service reminders, urgent announcements)

## Build Phases

### Phase 1 — MVP
- Registration + Payment + Approval flow
- Home (Announcements + Service Updates)
- Sermon archive
- Bible reader (online)

### Phase 2
- Daily devotion (scheduled scripture)
- Photo gallery with downloads
- Attendance tracking + admin management
- Admin login/dashboard

### Phase 3
- Birthday notifications
- Prayer request wall
- Push notifications
- Live stream link
- Full offline Bible download

## Tech Stack
- Frontend: HTML, CSS, JavaScript (PWA — installable, works offline for cached content)
- Backend: TBD (to be built starting Phase 1)
- Bible data: External free Bible API
- Payments: Stripe (or similar) for individual recurring payments