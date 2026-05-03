# Documentație Proiect Yardly

> Generată automat — acoperă întreaga bază de cod (Backend NestJS + Frontend Angular)

---

## Cuprins

1. [Prezentare Generală a Arhitecturii](#1-prezentare-generală-a-arhitecturii)
2. [Backend](#2-backend)
   - [Modulul App (Root)](#21-modulul-app-root)
   - [Modulul Auth](#22-modulul-auth)
   - [Modulul Users](#23-modulul-users)
   - [Modulul Fields](#24-modulul-fields)
   - [Modulul Reservations](#25-modulul-reservations)
   - [Modulul Sports](#26-modulul-sports)
   - [Modulul City](#27-modulul-city)
3. [Frontend](#3-frontend)
   - [Configurație Globală](#31-configurație-globală)
   - [Core — Guards](#32-core--guards)
   - [Core — Interceptori](#33-core--interceptori)
   - [Core — Pipe-uri](#34-core--pipe-uri)
   - [Core — Servicii API](#35-core--servicii-api)
   - [Store Global (NgRx Signals)](#36-store-global-ngrx-signals)
   - [Layout](#37-layout)
   - [Shared-UI — Componente Reutilizabile](#38-shared-ui--componente-reutilizabile)
   - [Feature: Auth](#39-feature-auth)
   - [Feature: Home](#310-feature-home)
   - [Feature: Fields List](#311-feature-fields-list)
   - [Feature: Field Details](#312-feature-field-details)
   - [Feature: Reservations](#313-feature-reservations)
   - [Feature: Booking Confirmation](#314-feature-booking-confirmation)
   - [Feature: Booking Details](#315-feature-booking-details)
   - [Feature: Join Game](#316-feature-join-game)
   - [Feature: User Profile](#317-feature-user-profile)
   - [Feature: Manager Portal](#318-feature-manager-portal)
   - [Feature: Admin Portal](#319-feature-admin-portal)
4. [Modele de Date](#4-modele-de-date)
5. [Sumar Endpoint-uri API](#5-sumar-endpoint-uri-api)
6. [Aspecte Transversale](#6-aspecte-transversale)
7. [Configurație & Environment](#7-configurație--environment)
8. [Stiluri & Design System](#8-stiluri--design-system)

---

## 1. Prezentare Generală a Arhitecturii

### Structura proiectului

Yardly este o platformă de rezervare terenuri sportive organizată ca **monorepo parțial** cu două aplicații independente:

```
Yardly/
├── backend/          # API NestJS (port 3000)
├── frontend/         # Aplicație Angular (port 4200)
├── stitch/           # Prototipuri UI (HTML + screenshot-uri)
├── terenuri-imagini-yardly/  # Imagini stoc terenuri
└── .agents/          # Documentație și reguli pentru agenți AI
```

### Framework-uri folosite

| Componentă | Tehnologie |
|---|---|
| Backend API | NestJS 11 + TypeScript 5.7 |
| Frontend | Angular 19.2 + TypeScript 5.7 |
| Baza de date | MongoDB (Mongoose 8) |
| Autentificare | JWT (passport-jwt) + bcrypt |
| State management | NgRx Signals 19.2 + NgRx Store/Entity |
| Stilizare | SCSS + Bootstrap 5.3 + FontAwesome 6 |
| SSR | @angular/ssr (Angular Universal) |
| Upload fișiere | Multer |

### Sistem de autentificare

Autentificarea folosește **JWT Bearer Token**:
1. Utilizatorul trimite `POST /auth/login` cu email + parolă
2. Backend-ul validează credențialele cu `bcrypt.compare`, generează un JWT semnat cu `JWT_SECRET`
3. Frontend-ul stochează token-ul în `localStorage` sub cheia `access_token`
4. `authInterceptor` (Angular `HttpInterceptorFn`) atașează automat `Authorization: Bearer <token>` la fiecare request HTTP
5. La inițializarea aplicației (`AppComponent.ngOnInit`), dacă există token în localStorage, se apelează `GET /auth/me` pentru a restaura sesiunea

**Roluri utilizatori:** `user`, `manager`, `admin`

### Patterns arhitecturale folosite

**Facade Pattern (Frontend):** Folosit în `AuthFacade` și `HomeFacade`. Facade-ul expune un ViewModel (`vm`) cu signals computed și metode delegate către store, izolând componentele UI de detaliile de implementare ale store-ului.

**Repository Pattern (Backend):** Serviciile NestJS (`UsersService`, `FieldsService`, etc.) acționează ca repository-uri, abstractizând accesul la MongoDB prin Mongoose.

**SignalStore Pattern (Frontend):** Starea globală este gestionată prin `@ngrx/signals` cu `signalStore()`, `withState()`, `withMethods()` și `rxMethod()` pentru operații asincrone reactive.

**Entity Pattern (Frontend):** Store-urile pentru colecții (fields, sports, cities) folosesc `@ngrx/signals/entities` cu `withEntities()`, `setAllEntities()`, `addEntity()`, `upsertEntity()`, `removeEntity()` pentru management eficient al colecțiilor normalizate.

### Structura folderelor Backend

```
src/
├── main.ts                 # Bootstrap, CORS, static assets
├── app.module.ts           # Root module
├── auth/                   # Autentificare JWT
│   ├── decorators/         # @Roles()
│   ├── dto/                # LoginDto, RegisterDto
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   └── strategies/         # JwtStrategy
├── users/                  # Gestionare utilizatori
│   └── schemas/            # UserSchema (Mongoose)
├── fields/                 # Terenuri sportive
│   ├── dto/                # CreateFieldDto, UpdateFieldDto
│   └── schemas/            # FieldSchema
├── reservation/            # Rezervări
│   ├── dto/                # CreateReservationDto
│   └── schemas/            # ReservationSchema
├── sports/                 # Tipuri de sporturi
│   ├── dto/                # CreateSportDto, UpdateSportDto
│   └── entities/           # Sport entity
└── city/                   # Orașe
    ├── dto/                # CreateCityDto, UpdateCityDto
    └── schemas/            # CitySchema
```

### Structura folderelor Frontend

```
src/app/
├── app.config.ts           # Providers globali
├── app.routes.ts           # Rutare lazy-loaded
├── app.component.ts        # Root component
├── core/
│   ├── guards/             # authGuard, guestGuard
│   ├── interceptors/       # authInterceptor
│   ├── interface/          # Option interface
│   ├── pipe/               # ImageUrlPipe, EntityNamePipe
│   ├── services/           # Servicii HTTP
│   └── store/              # UsersStore
├── store/                  # Store-uri globale NgRx Signals
│   ├── cities.store.ts
│   ├── fields.store.ts
│   ├── reservations.store.ts
│   ├── search.store.ts
│   └── sports.store.ts
├── layout/
│   ├── navbar/             # Navbar global
│   └── footer/             # Footer global
├── shared-ui/
│   ├── card/               # CardComponent
│   ├── skeleton/           # SkeletonComponent
│   ├── toast/              # Sistem notificări toast
│   └── yardly-input/       # Dropdown custom searchable
└── features/
    ├── auth/               # Login, Register, Forgot Password
    ├── home/               # Homepage
    ├── fields-list/        # Lista terenuri cu filtre
    ├── field-details/      # Detalii teren + booking
    ├── reservations/       # Rezervările mele + formular rezervare
    ├── booking-confirmation/ # Confirmare rezervare
    ├── booking-details/    # Detalii rezervare individuală
    ├── join-game/          # Alătură-te unui joc
    ├── not-found/          # Pagina 404 / Empty states
    ├── user-profile/       # Profil utilizator
    ├── manager/            # Portal manager (layout + 6 sub-pagini)
    └── admin/              # Portal admin (layout + 8 sub-pagini)
```

---

## 2. Backend

### 2.1 Modulul App (Root)

#### `AppModule` — Modul Root

**Fișier:** `src/app.module.ts`
**Scop:** Modulul rădăcină al aplicației NestJS. Configurează conexiunea MongoDB, importă toate modulele de feature și înregistrează variabilele de environment.

**Dependențe importate:**
- `ConfigModule.forRoot({ isGlobal: true })` — variabile de environment disponibile global
- `MongooseModule.forRoot(MONGODB_URI)` — conexiune MongoDB (default: `mongodb://localhost:27017/yardly`)
- `UsersModule`, `AuthModule`, `FieldsModule`, `ReservationsModule`, `SportsModule`, `CityModule`

---

#### `AppController` — Controller Root

**Fișier:** `src/app.controller.ts`
**Scop:** Controller minimal cu un singur endpoint de health check.

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `getHello()` | — | `string` | Returnează `"Hello World!"` — endpoint de test |

---

#### `AppService` — Serviciu Root

**Fișier:** `src/app.service.ts`
**Scop:** Serviciu minimal asociat controller-ului root.

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `getHello()` | — | `string` | Returnează string-ul `"Hello World!"` |

---

#### `main.ts` — Bootstrap

**Fișier:** `src/main.ts`
**Scop:** Punctul de intrare al aplicației. Configurează CORS, servire fișiere statice și pornește serverul.

**Configurări:**
- CORS activat pentru originile: `http://localhost:4200`, `http://localhost:4201`, `http://localhost:5173`
- Metode permise: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Header-uri permise: `Content-Type`, `Authorization`
- Fișiere statice servite din `/uploads` → prefix URL `/uploads`
- Port: `process.env.PORT ?? 3000`

---

### 2.2 Modulul Auth

#### `AuthModule` — Modul Autentificare

**Fișier:** `src/auth/auth.module.ts`
**Scop:** Gestionează înregistrarea, autentificarea și verificarea identității utilizatorilor prin JWT.

**Dependențe importate:**
- `UsersModule` (cu `forwardRef` pentru a evita dependența circulară)
- `PassportModule`
- `JwtModule.registerAsync` — configurare dinamică cu `JWT_SECRET` și `JWT_EXPIRES_IN` din environment

**Exporturi:** `JwtAuthGuard`, `RolesGuard`, `JwtModule`

---

#### `AuthController` — Controller Auth

**Fișier:** `src/auth/auth.controller.ts`
**Scop:** Expune endpoint-urile publice pentru autentificare și înregistrare.

**Metode:**

| Metodă | Endpoint | Guard | Parametri | Return | Descriere |
|---|---|---|---|---|---|
| `register()` | `POST /auth/register` | — | `@Body() dto: any` | `{ access_token, user }` | Înregistrează utilizator nou și returnează JWT |
| `login()` | `POST /auth/login` | — | `@Body() dto: any` | `{ access_token, user }` | Autentifică utilizatorul și returnează JWT |
| `getMe()` | `GET /auth/me` | `JwtAuthGuard` | `@Request() req` | `User` | Returnează utilizatorul autentificat curent |

**Gestionare erori:**
- `login()` aruncă `UnauthorizedException('Invalid credentials')` dacă credențialele sunt invalide

---

#### `AuthService` — Serviciu Auth

**Fișier:** `src/auth/auth.service.ts`
**Scop:** Logica de business pentru autentificare: validare parolă, generare JWT, hashing parolă la înregistrare.

**Dependențe injectate:** `JwtService`, `UsersService`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `validateUser()` | `email: string`, `pass: string` | `Promise<User \| null>` | Caută utilizatorul după email, compară parola cu `bcrypt.compare`. Returnează userul fără câmpul `password` sau `null` |
| `login()` | `user: any` | `Promise<{ access_token: string, user: any }>` | Generează JWT cu payload `{ email, sub: _id, role }` și îl returnează împreună cu userul |
| `register()` | `user: any` | `Promise<User>` | Hashează parola cu `bcrypt.hash(password, 10)`, setează `role: 'user'` și creează utilizatorul |
| `getMe()` | `userId: string` | `Promise<any>` | Delegă la `UsersService.findById(userId)` |

---

#### `JwtStrategy` — Strategie Passport

**Fișier:** `src/auth/strategies/jwt.strategy.ts`
**Scop:** Extrage și validează JWT-ul din header-ul `Authorization: Bearer <token>`. Populează `req.user` cu datele din payload.

**Configurare:**
- Extrage token din `Authorization: Bearer` header
- Verifică expirarea token-ului (`ignoreExpiration: false`)
- Folosește `JWT_SECRET` din environment

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `validate()` | `payload: { sub: string, email: string, role: string }` | `{ userId, email, role }` | Transformă payload-ul JWT în obiectul `req.user` |

---

#### `JwtAuthGuard` — Guard JWT

**Fișier:** `src/auth/guards/jwt-auth.guard.ts`
**Scop:** Guard care protejează endpoint-urile și necesită un JWT valid. Extinde `AuthGuard('jwt')` din `@nestjs/passport`.

**Utilizare:** `@UseGuards(JwtAuthGuard)` pe controller sau metodă.

---

#### `RolesGuard` — Guard Roluri

**Fișier:** `src/auth/guards/roles.guard.ts`
**Scop:** Guard care verifică dacă utilizatorul autentificat are unul dintre rolurile cerute. Folosit împreună cu decoratorul `@Roles()`.

**Dependențe injectate:** `Reflector`

**Logică:**
1. Citește metadatele `ROLES_KEY` de pe handler sau clasă via `Reflector`
2. Dacă nu există roluri cerute, permite accesul
3. Verifică dacă `req.user.role` este inclus în lista de roluri cerute

**Utilizare:** `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`

---

#### `@Roles()` — Decorator Custom

**Fișier:** `src/auth/decorators/roles.decorator.ts`
**Scop:** Decorator de metadata care marchează un endpoint cu rolurile necesare pentru acces.

**Semnătură:** `Roles(...roles: string[]) => SetMetadata(ROLES_KEY, roles)`

**Exemplu:** `@Roles('admin', 'manager')`

---

#### `LoginDto` — DTO Login

**Fișier:** `src/auth/dto/login.dto.ts`

| Câmp | Tip | Validare | Descriere |
|---|---|---|---|
| `email` | `string` | `@IsEmail()` | Adresa email a utilizatorului |
| `password` | `string` | `@IsNotEmpty()` | Parola utilizatorului |

---

#### `RegisterDto` — DTO Înregistrare

**Fișier:** `src/auth/dto/register.dto.ts`

| Câmp | Tip | Validare | Descriere |
|---|---|---|---|
| `username` | `string` | `@IsString`, `@IsNotEmpty`, `@MinLength(3)` | Numele de utilizator |
| `email` | `string` | `@IsEmail()` | Adresa email |
| `password` | `string` | `@IsString`, `@IsNotEmpty`, `@MinLength(6)` | Parola (min 6 caractere) |
| `role` | `string` | `@IsString` | Rolul (default setat la `'user'` în service) |

---

### 2.3 Modulul Users

#### `UsersModule` — Modul Utilizatori

**Fișier:** `src/users/users.module.ts`
**Scop:** Gestionează operațiunile CRUD pentru utilizatori.

**Dependențe:** `MongooseModule.forFeature([User])`, `AuthModule` (cu `forwardRef`)
**Exporturi:** `UsersService`

---

#### `UsersController` — Controller Utilizatori

**Fișier:** `src/users/users.controller.ts`
**Scop:** Expune endpoint-urile REST pentru gestionarea utilizatorilor.

**Metode:**

| Metodă | Endpoint | Guard | Rol necesar | Descriere |
|---|---|---|---|---|
| `getUserById()` | `GET /users/:id` | `JwtAuthGuard` | orice | Returnează utilizatorul după ID (fără parolă) |
| `findAllUsers()` | `GET /users` | `JwtAuthGuard + RolesGuard` | `admin` | Returnează toți utilizatorii (fără parole) |
| `updateUser()` | `PATCH /users/:id` | `JwtAuthGuard` | owner sau admin | Actualizează datele utilizatorului |
| `deleteUser()` | `DELETE /users/:id` | `JwtAuthGuard + RolesGuard` | `admin` | Șterge utilizatorul din baza de date |

**Gestionare erori:**
- `updateUser()` aruncă `ForbiddenException` dacă `req.user.userId !== id` și `req.user.role !== 'admin'`

---

#### `UsersService` — Serviciu Utilizatori

**Fișier:** `src/users/users.service.ts`
**Scop:** Accesul la baza de date MongoDB pentru operații pe colecția `users`.

**Dependențe injectate:** `@InjectModel(User.name) userModel: Model<UserDocument>`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `createUser()` | `user: Partial<User>` | `Promise<User>` | Creează și salvează un utilizator nou |
| `findByEmail()` | `email: string` | `Promise<User \| null>` | Caută utilizatorul după email (cu `.lean()` pentru performanță) |
| `findById()` | `id: string` | `Promise<User \| null>` | Caută utilizatorul după `_id`, exclude câmpul `password` |
| `findAll()` | — | `Promise<User[]>` | Returnează toți utilizatorii, exclude câmpul `password` |
| `updateUser()` | `id: string`, `dto: Partial<User>` | `Promise<User \| null>` | Actualizează utilizatorul; **șterge automat câmpurile `password` și `role` din DTO** pentru securitate |
| `deleteUser()` | `id: string` | `Promise<User \| null>` | Șterge utilizatorul din baza de date |

**Note de securitate:** `updateUser()` elimină explicit câmpurile `password` și `role` din DTO înainte de actualizare, prevenind escaladarea privilegiilor.

---

#### `UserSchema` — Schema Mongoose

**Fișier:** `src/users/schemas/user.schema.ts`

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `email` | `string` | Da | — | Adresa email, unică în colecție |
| `password` | `string` | Da | — | Parola hashată cu bcrypt |
| `username` | `string` | Da | — | Numele de utilizator |
| `role` | `string` | Nu | `'user'` | Rolul: `'user'`, `'admin'`, `'manager'` |
| `phone` | `string` | Nu | — | Numărul de telefon |
| `createdAt` | `Date` | — | auto | Generat de `timestamps: true` |
| `updatedAt` | `Date` | — | auto | Generat de `timestamps: true` |

---

### 2.4 Modulul Fields

#### `FieldsModule` — Modul Terenuri

**Fișier:** `src/fields/fields.module.ts`
**Scop:** Gestionează terenurile sportive cu upload imagini și calculul disponibilității.

**Dependențe:** `MongooseModule.forFeature([Field, User, Reservation])`, `AuthModule`
**Provideri:** `FieldsService`, `AvailabilityService`
**Exporturi:** `FieldsService`, `AvailabilityService`

---

#### `FieldsController` — Controller Terenuri

**Fișier:** `src/fields/fields.controller.ts`
**Scop:** Expune endpoint-urile REST pentru terenuri sportive. Suportă upload imagini via Multer în format `multipart/form-data`.

**Metode:**

| Metodă | Endpoint | Guard | Rol | Descriere |
|---|---|---|---|---|
| `create()` | `POST /fields` | `JwtAuthGuard + RolesGuard` | `manager`, `admin` | Creează teren nou cu imagini uploadate |
| `findAll()` | `GET /fields` | — | public | Returnează toate terenurile cu populate manager |
| `findOne()` | `GET /fields/:id` | — | public | Returnează un teren după ID |
| `update()` | `PATCH /fields/:id` | `JwtAuthGuard + RolesGuard` | `manager`, `admin` | Actualizează teren (cu imagini noi opțional) |
| `remove()` | `DELETE /fields/:id` | `JwtAuthGuard + RolesGuard` | `manager`, `admin` | Șterge terenul |

**Note:** `schedule` și `facilities` sunt trimise ca JSON string în multipart form și parsate manual cu `JSON.parse()` în controller.

---

#### `FieldsService` — Serviciu Terenuri

**Fișier:** `src/fields/fields.service.ts`
**Scop:** Logica de business pentru terenuri: creare cu validare manager, listare cu populate, actualizare, ștergere.

**Dependențe injectate:** `fieldModel: Model<FieldDocument>`, `userModel: Model<UserDocument>`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `create()` | `dto: CreateFieldDto`, `images: string[]` | `Promise<Field>` | Validează că managerul are rolul `'manager'`, creează terenul |
| `findAll()` | — | `Promise<Field[]>` | Returnează toate terenurile cu populate pe câmpul `manager` |
| `findOne()` | `id: string` | `Promise<Field>` | Returnează terenul după ID |
| `update()` | `id: string`, `dto: UpdateFieldDto`, `images?: string[]` | `Promise<Field>` | Actualizează terenul; dacă sunt imagini noi le adaugă la lista existentă |
| `remove()` | `id: string` | `Promise<Field>` | Șterge terenul din baza de date |

**Gestionare erori:**
- `create()` aruncă `BadRequestException` dacă managerul specificat nu are rolul `'manager'`

---

#### `AvailabilityService` — Serviciu Disponibilitate

**Fișier:** `src/fields/availability.service.ts`
**Scop:** Calculează și actualizează statusul de disponibilitate al unui teren (`available`, `limited`, `full`) pe baza rezervărilor dintr-o zi.

**Dependențe injectate:** `reservationModel: Model<ReservationDocument>`, `fieldModel: Model<FieldDocument>`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `updateFieldStatus()` | `fieldId: string` | `Promise<void>` | Calculează procentul de timp rezervat și actualizează statusul: `>= 100%` → `full`, `>= 70%` → `limited`, altfel → `available` |

---

#### `CreateFieldDto` — DTO Creare Teren

**Fișier:** `src/fields/dto/create-field.dto.ts`

| Câmp | Tip | Required | Descriere |
|---|---|---|---|
| `name` | `string` | Da | Numele terenului |
| `sport` | `string` | Da | ID-ul sportului (referință MongoDB) |
| `address` | `string` | Da | Adresa terenului |
| `locationUrl` | `string` | Nu | URL Google Maps |
| `pricePerHour` | `number` | Da | Prețul pe oră în RON |
| `schedule` | `ScheduleDto[]` | Da | Program zilnic: `[{ day, from, to }]` |
| `facilities` | `string[]` | Nu | Lista facilități (ex: `['Vestiare', 'Parcare']`) |
| `manager` | `string` | Da | ID MongoDB al managerului (validat cu `@IsMongoId`) |

**`ScheduleDto`:** `{ day: string, from: string, to: string }` — ex: `{ day: "Luni", from: "08:00", to: "22:00" }`

---

#### `UpdateFieldDto` — DTO Actualizare Teren

**Fișier:** `src/fields/dto/update-field.dto.ts`
**Scop:** Extinde `CreateFieldDto` cu `PartialType`, toate câmpurile devin opționale.

---

#### `FieldSchema` — Schema Mongoose

**Fișier:** `src/fields/schemas/field.schema.ts`

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `name` | `string` | Da | — | Numele terenului |
| `sport` | `ObjectId` (ref: Sport) | Da | — | Tipul de sport |
| `address` | `string` | Da | — | Adresa fizică |
| `locationUrl` | `string` | Nu | — | Link Google Maps |
| `description` | `string` | Nu | — | Descriere teren |
| `capacity` | `number` | Nu | — | Capacitate maxim jucători |
| `city` | `ObjectId` (ref: City) | Da | — | Orașul terenului |
| `pricePerHour` | `number` | Da | — | Prețul pe oră (RON) |
| `schedule` | `[{ day, from, to }]` | Nu | `[]` | Programul de funcționare pe zile |
| `images` | `string[]` | Nu | `[]` | Căile relative ale imaginilor uploadate |
| `facilities` | `string[]` | Nu | `[]` | Lista de facilități disponibile |
| `averageRating` | `number` | Nu | `0` | Rating mediu (0-5) |
| `status` | `string` | Nu | `''` | `available` / `limited` / `full` |
| `manager` | `ObjectId` (ref: User) | Da | — | Managerul responsabil |

---

### 2.5 Modulul Reservations

#### `ReservationsModule` — Modul Rezervări

**Fișier:** `src/reservation/reservations.module.ts`
**Scop:** Gestionează rezervările terenurilor cu validare sloturi, verificare suprapuneri și recalculare disponibilitate.

---

#### `ReservationsController` — Controller Rezervări

**Fișier:** `src/reservation/reservations.controller.ts`
**Scop:** Expune endpoint-urile REST pentru rezervări.

**Metode:**

| Metodă | Endpoint | Guard | Descriere |
|---|---|---|---|
| `getAvailableSlots()` | `GET /reservations/availability` | — (public) | Returnează sloturile libere pentru un teren, dată și durată |
| `createReservation()` | `POST /reservations` | `JwtAuthGuard` | Creează o rezervare nouă |
| `findMyReservations()` | `GET /reservations/my` | `JwtAuthGuard` | Returnează rezervările utilizatorului autentificat |
| `findAllReservations()` | `GET /reservations` | `JwtAuthGuard + RolesGuard(admin)` | Returnează toate rezervările (doar admin) |
| `findOneReservation()` | `GET /reservations/:id` | `JwtAuthGuard` | Returnează o rezervare după ID |
| `updateReservation()` | `PATCH /reservations/:id` | `JwtAuthGuard` | Actualizează o rezervare |
| `deleteReservation()` | `DELETE /reservations/:id` | `JwtAuthGuard` | Anulează și șterge rezervarea, recalculează disponibilitatea |

**Query params pentru `getAvailableSlots`:** `field` (string), `date` (string), `duration` (string)

---

#### `ReservationsService` — Serviciu Rezervări

**Fișier:** `src/reservation/reservations.service.ts`
**Scop:** Logica de business pentru rezervări: validare program teren, verificare suprapuneri sloturi, generare sloturi de 30 minute.

**Dependențe injectate:** `reservationModel`, `fieldModel`, `AvailabilityService`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `create()` | `dto: CreateReservationDto` | `Promise<Reservation>` | Validează programul terenului, verifică suprapunerile cu alte rezervări, generează sloturi de 30 min, salvează și recalculează statusul terenului |
| `getAvailableSlots()` | `fieldId: string`, `date: string`, `duration: string` | `Promise<{ from, to }[]>` | Generează toate sloturile posibile în intervalul programului terenului și elimină cele deja rezervate |
| `findAll()` | — | `Promise<Reservation[]>` | Returnează toate rezervările cu populate pe `field` și `user` |
| `findByUser()` | `userId: string` | `Promise<Reservation[]>` | Returnează rezervările unui utilizator specific |
| `findOne()` | `id: string` | `Promise<Reservation>` | Returnează o rezervare după ID |
| `update()` | `id: string`, `dto: Partial<Reservation>` | `Promise<Reservation>` | Actualizează rezervarea |
| `remove()` | `id: string` | `Promise<void>` | Șterge rezervarea și apelează `AvailabilityService.updateFieldStatus()` |
| `parseDuration()` | `duration: string` | `number` | Convertește `"2h"` → `120`, `"2h30"` → `150` (minute) |
| `generateSlots()` | `from: string`, `duration: number` | `{ from, to }[]` | Împarte durata rezervării în blocuri de 30 de minute |

**Gestionare erori:**
- `create()` aruncă `BadRequestException` dacă terenul nu are program pentru ziua respectivă
- `create()` aruncă `ConflictException` dacă există suprapunere cu o altă rezervare existentă

---

#### `CreateReservationDto` — DTO Creare Rezervare

**Fișier:** `src/reservation/dto/create-reservation.dto.ts`

| Câmp | Tip | Required | Descriere |
|---|---|---|---|
| `field` | `string` (MongoId) | Da | ID-ul terenului rezervat |
| `user` | `string` (MongoId) | Da | ID-ul utilizatorului care rezervă |
| `date` | `string` | Da | Data rezervării (format: `YYYY-MM-DD`) |
| `time` | `string` | Da | Ora de start (format: `HH:MM`) |
| `duration` | `string` | Da | Durata (ex: `"1h"`, `"1h30"`, `"2h"`) |
| `isEvent` | `boolean` | Nu | Marchează rezervarea ca eveniment public |
| `isRecurrent` | `boolean` | Nu | Marchează rezervarea ca recurentă |

---

#### `ReservationSchema` — Schema Mongoose

**Fișier:** `src/reservation/schemas/reservation.schema.ts`

| Câmp | Tip | Descriere |
|---|---|---|
| `field` | `ObjectId` (ref: Field) | Terenul rezervat |
| `user` | `ObjectId` (ref: User) | Utilizatorul care a rezervat |
| `date` | `string` | Data rezervării |
| `time` | `string` | Ora de start (format `HH:MM`) |
| `duration` | `string` | Durata rezervării |
| `isEvent` | `boolean` | Este eveniment public? |
| `isRecurrent` | `boolean` | Este recurentă? |
| `slots` | `[{ from: string, to: string }]` | Sloturile de 30 min generate automat |

---

### 2.6 Modulul Sports

#### `SportsController` — Controller Sporturi

**Fișier:** `src/sports/sports.controller.ts`
**Scop:** CRUD pentru tipurile de sporturi. Suportă upload icon imagine.

**Metode:**

| Metodă | Endpoint | Guard | Rol | Descriere |
|---|---|---|---|---|
| `create()` | `POST /sports` | `JwtAuthGuard + RolesGuard` | `admin` | Creează sport nou cu icon opțional |
| `findAll()` | `GET /sports` | — | public | Returnează toate sporturile |
| `findOne()` | `GET /sports/:id` | — | public | Returnează un sport după ID |
| `update()` | `PATCH /sports/:id` | `JwtAuthGuard + RolesGuard` | `admin` | Actualizează sportul, cu icon opțional |
| `remove()` | `DELETE /sports/:id` | `JwtAuthGuard + RolesGuard` | `admin` | Șterge sportul |

**Notă:** Iconul este uploadat în `/uploads/icons/` prin Multer.

---

#### `SportsService` — Serviciu Sporturi

**Fișier:** `src/sports/sports.service.ts`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `create()` | `dto: CreateSportDto`, `icon?: string` | `Promise<Sport>` | Creează sport cu calea iconului |
| `findAll()` | — | `Promise<Sport[]>` | Returnează toate sporturile |
| `findOne()` | `id: string` | `Promise<Sport>` | Returnează sport după ID |
| `update()` | `id: string`, `dto: UpdateSportDto`, `icon?: string` | `Promise<Sport>` | Actualizează sportul |
| `remove()` | `id: string` | `Promise<Sport>` | Șterge sportul |

---

#### `Sport` — Entitate

**Fișier:** `src/sports/entities/sport.entity.ts`

| Câmp | Tip | Required | Descriere |
|---|---|---|---|
| `name` | `string` | Da | Numele sportului (unic) |
| `icon` | `string` | Da | Calea relativă a iconului |

---

#### `CreateSportDto` — DTO Creare Sport

**Fișier:** `src/sports/dto/create-sport.dto.ts`

| Câmp | Tip | Required | Descriere |
|---|---|---|---|
| `name` | `string` | Da | Numele sportului |
| `icon` | `string` | Nu | Calea iconului (setat automat din upload) |

---

### 2.7 Modulul City

#### `CityController` — Controller Orașe

**Fișier:** `src/city/city.controller.ts`
**Scop:** CRUD pentru orașe. Ștergerea este **soft delete** (setează `isActive: false`).

**Metode:**

| Metodă | Endpoint | Guard | Rol | Descriere |
|---|---|---|---|---|
| `findAll()` | `GET /cities` | — | public | Returnează orașele active (`isActive: true`) |
| `create()` | `POST /cities` | `JwtAuthGuard + RolesGuard` | `admin` | Creează un oraș nou |
| `findOne()` | `GET /cities/:id` | — | public | Returnează un oraș după ID |
| `update()` | `PATCH /cities/:id` | `JwtAuthGuard + RolesGuard` | `admin` | Actualizează un oraș |
| `remove()` | `DELETE /cities/:id` | `JwtAuthGuard + RolesGuard` | `admin` | Soft delete: setează `isActive: false` |

---

#### `CityService` — Serviciu Orașe

**Fișier:** `src/city/city.service.ts`

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `findAll()` | — | `Promise<City[]>` | Returnează orașele cu `isActive: true` |
| `create()` | `dto: CreateCityDto` | `Promise<City>` | Creează oraș nou |
| `findOne()` | `id: string` | `Promise<City>` | Returnează oraș după ID |
| `update()` | `id: string`, `dto: UpdateCityDto` | `Promise<City>` | Actualizează orașul |
| `remove()` | `id: string` | `Promise<City>` | Soft delete: `{ isActive: false }` |

---

#### `CitySchema` — Schema Mongoose

**Fișier:** `src/city/schemas/city.schemas.ts`

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `name` | `string` | Da | — | Numele orașului |
| `country` | `string` | Da | — | Țara |
| `isActive` | `boolean` | Nu | `true` | Flag soft delete |

---

#### `CreateCityDto` / `UpdateCityDto`

**Fișier:** `src/city/dto/`

| Câmp | Tip | `Create` | `Update` | Descriere |
|---|---|---|---|---|
| `name` | `string` | Required | Opțional | Numele orașului |
| `country` | `string` | Required | Opțional | Țara |
| `isActive` | `boolean` | — | Opțional | Flag activare/dezactivare |

---

## 3. Frontend

### 3.1 Configurație Globală

#### `app.config.ts` — Configurație Aplicație

**Fișier:** `src/app/app.config.ts`
**Scop:** Definește providerii globali ai aplicației Angular standalone.

**Provideri configurați:**
- `{ provide: LOCALE_ID, useValue: 'ro' }` — formatare dată/număr în română
- `registerLocaleData(localeRo)` — înregistrează datele locale românești
- `provideHttpClient(withInterceptors([authInterceptor]))` — client HTTP cu interceptor JWT
- `provideRouter(routes)` — router cu rutele din `app.routes.ts`
- `provideZoneChangeDetection({ eventCoalescing: true })` — optimizare change detection

---

#### `app.routes.ts` — Configurație Rutare

**Fișier:** `src/app/app.routes.ts`
**Scop:** Definește toate rutele aplicației cu **lazy loading** (toate componentele sunt încărcate la cerere cu `loadComponent`).

**Rute definite:**

| Cale | Componentă | Descriere |
|---|---|---|
| `/` | `HomeComponent` | Pagina principală |
| `/fields` | `FieldsListComponent` | Lista terenuri cu filtre |
| `/field-details/:id` | `FieldDetailsComponent` | Detalii teren + rezervare |
| `/reservations` | `ReservationsComponent` | Formular rezervare + calendar |
| `/booking-confirmation` | `BookingConfirmationComponent` | Confirmare după rezervare |
| `/booking-details/:id` | `BookingDetailsComponent` | Detalii rezervare individuală |
| `/join/:code` | `JoinGameComponent` | Alătură-te unui joc |
| `/login` | `LoginComponent` | Autentificare |
| `/register` | `RegisterComponent` | Înregistrare |
| `/forgot-password` | `ForgotPasswordComponent` | Recuperare parolă |
| `/profile` | `UserProfileComponent` | Profil utilizator |
| `/manager` | `ManagerLayoutComponent` | Layout portal manager (child routes) |
| `/manager/dashboard` | `ManagerDashboardComponent` | Dashboard manager |
| `/manager/fields` | `ManagerFieldsComponent` | Terenurile mele |
| `/manager/field-editor` | `FieldEditorComponent` | Editor teren |
| `/manager/reservations` | `ManagerReservationsComponent` | Rezervări manager |
| `/manager/analytics` | `ManagerAnalyticsComponent` | Analitics manager |
| `/manager/settings` | `ManagerSettingsComponent` | Setări manager |
| `/admin` | `AdminLayoutComponent` | Layout portal admin (child routes) |
| `/admin/dashboard` | `AdminDashboardComponent` | Dashboard admin |
| `/admin/users` | `AdminUsersComponent` | Gestionare utilizatori |
| `/admin/managers` | `AdminManagersComponent` | Gestionare manageri |
| `/admin/fields` | `AdminFieldsComponent` | Moderare terenuri |
| `/admin/cities` | `AdminCitiesComponent` | Gestionare orașe |
| `/admin/bookings` | `AdminBookingsComponent` | Rezervări admin |
| `/admin/disputes` | `AdminDisputesComponent` | Dispute |
| `/admin/finances` | `AdminFinancesComponent` | Finanțe (stub) |
| `/admin/settings` | `AdminSettingsComponent` | Setări admin (stub) |
| `**` | `NotFoundComponent` | Pagina 404 |

---

#### `AppComponent` — Componenta Root

**Fișier:** `src/app/app.component.ts`
**Scop:** Componenta rădăcină a aplicației. Montează layout-ul global și restaurează sesiunea la inițializare.

**Template inline:**
```html
<yardly-toast-container></yardly-toast-container>
<app-navbar></app-navbar>
<router-outlet></router-outlet>
<app-footer></app-footer>
```

**Logică `ngOnInit`:** Dacă există `access_token` în localStorage, apelează `authStore.loadMe()` pentru a restaura sesiunea (populează `user` în store fără a necesita re-login).

---

#### `app.state.ts` — Interfața AppState

**Fișier:** `src/app/app.state.ts`
**Scop:** Definește interfața stării globale NgRx Store clasic (folosit minimal, alături de NgRx Signals).

```typescript
export interface AppState {
  search: SearchState;
}
```

---

### 3.2 Core — Guards

#### `authGuard` — Guard Autentificare

**Fișier:** `src/app/core/guards/auth.guards.ts`
**Tip:** `CanActivateFn`
**Scop:** Protejează rutele care necesită autentificare. Redirectează la `/auth/login` dacă utilizatorul nu este autentificat.

**Logică:** Verifică `authFacade.vm.isLoggedIn()` (computed signal bazat pe prezența token-ului).

---

#### `guestGuard` — Guard Oaspeți

**Fișier:** `src/app/core/guards/auth.guards.ts`
**Tip:** `CanActivateFn`
**Scop:** Protejează rutele care trebuie accesate doar de utilizatori neautentificați (ex: login, register). Redirectează la `/` dacă utilizatorul este deja autentificat.

**Notă:** Definit dar **neaplicat** pe rute în configurația curentă.

---

### 3.3 Core — Interceptori

#### `authInterceptor` — Interceptor HTTP

**Fișier:** `src/app/core/interceptors/auth.interceptor.ts`
**Tip:** `HttpInterceptorFn`
**Scop:** Atașează automat token-ul JWT la fiecare request HTTP prin header-ul `Authorization: Bearer <token>`.

**Logică:**
1. Verifică că rulează în browser (`isPlatformBrowser`) — nu se execută la SSR
2. Citește `access_token` din `localStorage`
3. Dacă token-ul există, clonează request-ul cu header-ul `Authorization`
4. Dacă nu există token, request-ul trece nemodificat

---

### 3.4 Core — Pipe-uri

#### `ImageUrlPipe` — Pipe Imagini

**Fișier:** `src/app/core/pipe/image.pipe.ts`
**Scop:** Transformă calea relativă a unei imagini (ex: `/uploads/field.jpg`) în URL absolut (`http://localhost:3000/uploads/field.jpg`).

**Semnătură:** `transform(imagePath: string): string`
**Utilizare în template:** `field.images[0] | imageUrl`

---

#### `EntityNamePipe` — Pipe Nume Entitate

**Fișier:** `src/app/core/pipe/entityName.pipe.ts`
**Scop:** Rezolvă ID-ul unei entități (sport sau city) la numele său textual, citind din NgRx Store.

**Semnătură:** `transform(entityId: string, entityType: 'sport' | 'city' | 'facility'): string`
**Utilizare:** `field.sport | entityName:'sport'`

**Note:** Este `pure: false` deoarece citește din store (care se poate schimba). Implementează un cache intern (`{ [key: string]: string }`) pentru performanță. Abonarea la store se face prin subscribe intern — pattern non-standard față de `AsyncPipe`.

---

### 3.5 Core — Servicii API

Toate serviciile folosesc `HttpClient` și URL-ul de bază `environment.apiUrl` (`http://localhost:3000`).

#### `AuthService`

**Fișier:** `src/app/core/services/auth.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `login()` | `POST /auth/login` | `credentials: any` | `Observable<{ access_token, user }>` | Autentificare |
| `register()` | `POST /auth/register` | `dto: any` | `Observable<{ access_token, user }>` | Înregistrare |
| `forgotPassword()` | `POST /auth/forgot-password` | `email: string` | `Observable<any>` | Trimitere link resetare parolă |
| `getMe()` | `GET /auth/me` | — | `Observable<any>` | Obține utilizatorul curent (necesită token) |

---

#### `CityService`

**Fișier:** `src/app/core/services/city.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `getAllCities()` | `GET /cities` | — | `Observable<City[]>` | Toate orașele active |
| `getCityById()` | `GET /cities/:id` | `id: string` | `Observable<City>` | Oraș după ID |
| `createCity()` | `POST /cities` | `dto: Partial<City>` | `Observable<City>` | Creare oraș (admin) |
| `updateCity()` | `PATCH /cities/:id` | `id: string`, `dto: Partial<City>` | `Observable<City>` | Actualizare oraș (admin) |
| `deleteCity()` | `DELETE /cities/:id` | `id: string` | `Observable<void>` | Ștergere oraș (admin) |

---

#### `FieldsService`

**Fișier:** `src/app/core/services/fields.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `getAllFields()` | `GET /fields` | — | `Observable<Field[]>` | Toate terenurile |
| `getFieldById()` | `GET /fields/:id` | `id: string` | `Observable<Field>` | Teren după ID |
| `createField()` | `POST /fields` | `data: FormData` | `Observable<Field>` | Creare teren cu imagini |
| `updateField()` | `PATCH /fields/:id` | `id: string`, `data: FormData` | `Observable<Field>` | Actualizare teren |
| `deleteField()` | `DELETE /fields/:id` | `id: string` | `Observable<void>` | Ștergere teren |

---

#### `ReservationsService`

**Fișier:** `src/app/core/services/reservation.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `getAvailableSlots()` | `GET /reservations/availability` | `field, date, duration: string` | `Observable<{from,to}[]>` | Sloturi disponibile |
| `getAll()` | `GET /reservations` | — | `Observable<Reservation[]>` | Toate rezervările (admin) |
| `getMyReservations()` | `GET /reservations/my` | — | `Observable<Reservation[]>` | Rezervările mele |
| `getById()` | `GET /reservations/:id` | `id: string` | `Observable<Reservation>` | Rezervare după ID |
| `createReservation()` | `POST /reservations` | `reservation: Omit<Reservation, '_id'\|'slots'>` | `Observable<Reservation>` | Creare rezervare |
| `updateReservation()` | `PATCH /reservations/:id` | `id, dto` | `Observable<Reservation>` | Actualizare rezervare |
| `deleteReservation()` | `DELETE /reservations/:id` | `id: string` | `Observable<void>` | Ștergere rezervare |

---

#### `SportsService`

**Fișier:** `src/app/core/services/sports.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `getAll()` | `GET /sports` | — | `Observable<Sport[]>` | Toate sporturile |
| `getById()` | `GET /sports/:id` | `id: string` | `Observable<Sport>` | Sport după ID |
| `create()` | `POST /sports` | `formData: FormData` | `Observable<Sport>` | Creare sport cu icon |
| `update()` | `PATCH /sports/:id` | `id, formData` | `Observable<Sport>` | Actualizare sport |
| `delete()` | `DELETE /sports/:id` | `id: string` | `Observable<void>` | Ștergere sport |

---

#### `ThemeService`

**Fișier:** `src/app/core/services/theme.service.ts`
**Scop:** Gestionează tema aplicației (dark/light) cu persistare în `localStorage` și aplicare pe `document.documentElement`.

**State intern:**
- `theme: Signal<'dark' | 'light'>` — tema curentă (default: `'dark'`)

**Metode:**

| Metodă | Parametri | Return | Descriere |
|---|---|---|---|
| `toggle()` | — | `void` | Comută între dark și light |
| `isDark()` | — | `boolean` | Returnează `true` dacă tema curentă este dark |

**Efecte:** La schimbarea temei, setează `data-theme` pe `<html>` și salvează în `localStorage` cu cheia `'yardly-theme'`. SSR-safe (verifică `isPlatformBrowser`).

---

#### `UsersService` (frontend)

**Fișier:** `src/app/core/services/users.service.ts`

| Metodă | Endpoint | Parametri | Return | Descriere |
|---|---|---|---|---|
| `getAll()` | `GET /users` | — | `Observable<User[]>` | Toți utilizatorii (admin) |
| `getById()` | `GET /users/:id` | `id: string` | `Observable<User>` | Utilizator după ID |
| `update()` | `PATCH /users/:id` | `id: string`, `dto: UpdateUserDto` | `Observable<User>` | Actualizare profil |
| `delete()` | `DELETE /users/:id` | `id: string` | `Observable<void>` | Ștergere utilizator |

**Interfețe exportate:**
```typescript
interface User { _id, email, username, role, phone?, createdAt? }
interface UpdateUserDto { username?, phone? }
```

---

### 3.6 Store Global (NgRx Signals)

#### `UsersStore`

**Fișier:** `src/app/core/store/users.store.ts`
**Scop:** Gestionează starea utilizatorilor pentru secțiunile de admin.

**State:**

| Câmp | Tip | Default | Descriere |
|---|---|---|---|
| `users` | `User[]` | `[]` | Lista utilizatorilor |
| `selectedUser` | `User \| null` | `null` | Utilizatorul selectat |
| `loading` | `boolean` | `false` | Status loading |
| `error` | `string \| null` | `null` | Mesaj eroare |

**Metode:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `loadUsers()` | `void` | Încarcă toți utilizatorii din API |
| `loadUser()` | `string` (id) | Încarcă un utilizator după ID |
| `updateUser()` | `{ id: string, dto: UpdateUserDto }` | Actualizează utilizatorul și sincronizează lista |
| `deleteUser()` | `string` (id) | Șterge utilizatorul și îl elimină din listă |
| `clearSelectedUser()` | — | Resetează `selectedUser` la `null` |

---

#### `CitiesStore`

**Fișier:** `src/app/store/cities.store.ts`
**Scop:** Starea globală pentru colecția de orașe, cu entity management normalizat.

**Entity config:** `selectId: (city: City) => city._id`

**State adițional:** `loading: boolean`, `error: string | null`

**Metode:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `loadCities()` | `void` | Încarcă toate orașele și le setează în store cu `setAllEntities` |
| `createCity()` | `Partial<City>` | Creează oraș nou și îl adaugă cu `addEntity` |
| `updateCity()` | `{ id, dto }` | Actualizează și upsertează cu `upsertEntity` |
| `deleteCity()` | `string` (id) | Șterge cu `removeEntity` |

---

#### `FieldsStore`

**Fișier:** `src/app/store/fields.store.ts`
**Scop:** Starea globală pentru colecția de terenuri, cu entity management normalizat.

**State adițional:** `loading`, `error`, `selectedField: Field | null`

**Metode:** `loadFields()`, `loadField(id)`, `createField(FormData)`, `updateField({ id, fieldData })`, `deleteField(id)`

---

#### `ReservationsStore`

**Fișier:** `src/app/store/reservations.store.ts`
**Scop:** Starea globală pentru rezervări. La crearea cu succes navighează automat la `/booking-confirmation`.

**State:**

| Câmp | Tip | Descriere |
|---|---|---|
| `reservations` | `Reservation[]` | Lista rezervărilor |
| `selectedReservation` | `Reservation \| null` | Rezervarea selectată |
| `availableSlots` | `{ from, to }[]` | Sloturile disponibile pentru rezervare |
| `loading` | `boolean` | Status loading |
| `error` | `string \| null` | Mesaj eroare |

**Metode:** `loadAvailableSlots({ field, date, duration })`, `clearAvailableSlots()`, `loadReservations()`, `loadMyReservations()`, `loadReservation(id)`, `createReservation(dto)`, `updateReservation({ id, dto })`, `deleteReservation(id)`

**Efect special:** `createReservation()` navighează la `/booking-confirmation` după succes via `Router`.

---

#### `SearchStore`

**Fișier:** `src/app/store/search.store.ts`
**Scop:** Stochează criteriile de căutare din homepage și navighează la `/fields`.

**State:**

| Câmp | Tip | Descriere |
|---|---|---|
| `searchBarInterface` | `SearchbarInterface \| null` | Filtrele de căutare curente |
| `loading` | `boolean` | Status loading |

**Metode:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `search()` | `filters: SearchbarInterface` | Salvează filtrele și navighează la `/fields` |

**`SearchbarInterface`:** `{ sport: string, city: string, date: string, time: string }`

---

#### `SportsStore`

**Fișier:** `src/app/store/sports.store.ts`
**Scop:** Starea globală pentru sporturi, cu entity management.

**Metode:** `loadSports()`, `createSport(FormData)`, `updateSport({ id, formData })`, `deleteSport(id)`

---

#### Interfețe de State

**`City`** (`city.state.ts`): `{ _id, name, country? }`

**`Field`** (`fields.state.ts`):
```typescript
{
  _id, name, sport, address, locationUrl?,
  pricePerHour, schedule: Schedule[],
  images: string[], facilities: string[],
  averageRating, status, capacity, city,
  description?, manager: { _id, username, email }
}
```

**`Schedule`**: `{ day: string, from: string, to: string }`

**`Reservation`** (`reservation.state.ts`):
```typescript
{
  _id?, field, user, date, time, duration,
  isEvent?, isRecurrent?,
  slots?: { from: string, to: string }[]
}
```

**`Sport`** (`sports.model.ts`): `{ _id, name, icon }`

---

### 3.7 Layout

#### `NavbarComponent` — Navbar

**Fișier:** `src/app/layout/navbar/navbar.component.ts`
**Selector:** `app-navbar`
**Tip:** Componentă Layout
**Scop:** Header global sticky cu logo, navigație principală, toggle temă dark/light și meniu mobil hamburger.

**Dependențe injectate:** `AuthFacade`, `ThemeService`

**State intern (Signals):**
- `isScrolled: Signal<boolean>` — `true` dacă `window.scrollY > 50`
- `mobileMenuActive: Signal<boolean>` — starea meniului mobil

**Metode:**

| Metodă | Descriere |
|---|---|
| `onWindowScroll()` | Listener `@HostListener('window:scroll')` — actualizează `isScrolled` |
| `onResize()` | Listener `@HostListener('window:resize')` — închide meniul mobil pe ecrane > 768px |
| `toggleMobileMenu()` | Comută vizibilitatea meniului mobil |
| `logout()` | Apelează `authFacade.logout()` și închide meniul mobil |

**Navigație afișată condiționat:**
- Neautentificat: Home, Fields, Login
- Autentificat: Home, Fields, Reservations, Profile, Logout

---

#### `FooterComponent` — Footer

**Fișier:** `src/app/layout/footer/footer.component.ts`
**Selector:** `app-footer`
**Scop:** Footer simplu cu copyright `© 2024 Yardly`. Componentă prezentațională fără logică.

---

### 3.8 Shared-UI — Componente Reutilizabile

#### `CardComponent` — Card Teren

**Fișier:** `src/app/shared-ui/card/card.component.ts`
**Selector:** `app-card`
**Tip:** Componentă UI reutilizabilă

**Scop:** Afișează un card de teren sportiv cu imagine, rating, status disponibilitate, adresă, preț, facilități și buton de rezervare.

**Props:**

| Prop | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `field` | `any` | Da | — | Obiectul Field de afișat |

**Outputuri:**

| Output | Tip | Descriere |
|---|---|---|
| `viewDetails` | `EventEmitter<string>` | Emite ID-ul terenului când utilizatorul face click |

**Metode:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `goToDetails()` | `fieldId?: string` | Emite evenimentul `viewDetails` cu ID-ul terenului |

**Comportament UI:**
- Imaginea primară este afișată cu `imageUrl` pipe
- Badge rating poziționat peste imagine
- Badge status: `Disponibil` (verde) sau valoarea `field.status`
- Facilități: primele 3 afișate ca taguri, restul ca `+N`
- Butonul REZERVĂ este dezactivat (`disabled`) când `status === 'full'`
- Click pe card sau buton emite `viewDetails`

---

#### `SkeletonComponent` — Loading Skeleton

**Fișier:** `src/app/shared-ui/skeleton/skeleton.component.ts`
**Selector:** `app-skeleton`
**Tip:** Componentă UI — Loading State

**Scop:** Afișează placeholder-uri animate de tip skeleton pentru stările de loading. Suportă 5 tipuri diferite de layout.

**Props:**

| Prop | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `type` | `'field-card' \| 'stat' \| 'table-row' \| 'slots' \| 'field-detail'` | Nu | `'field-card'` | Tipul de skeleton afișat |
| `count` | `number` | Nu | `3` | Numărul de elemente skeleton de afișat |

**Tipuri disponibile:**
- `field-card` — grid de carduri cu imagine + linii text (pentru lista de terenuri)
- `stat` — carduri de statistici cu titlu + valoare mare (pentru dashboard)
- `table-row` — rânduri de tabel cu coloane (pentru tabele admin)
- `slots` — grid de butoane dreptunghiulare (pentru sloturi orar)
- `field-detail` — layout complex cu galerie + content + panel lateral (pentru pagina de detalii teren)

---

#### `ToastService` — Serviciu Notificări Toast

**Fișier:** `src/app/shared-ui/toast/yardly-toast.service.ts`
**Tip:** Serviciu Singleton (`providedIn: 'root'`)

**Scop:** Serviciu central pentru trimiterea notificărilor toast. Folosește un `Subject` RxJS ca bus de evenimente.

**Interfață exportată:**
```typescript
interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning';
}
```

**API public:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `show()` | `message: string`, `type?: 'success' \| 'error' \| 'warning'` | Emite un toast. `type` default: `'success'` |
| `toastState$` | `Observable<ToastMessage>` | Observable la care se abonează container-ul |

---

#### `YardlyToastComponent` — Toast Individual

**Fișier:** `src/app/shared-ui/toast/yardly-toast/yardly-toast.component.ts`
**Selector:** `yardly-toast`
**Tip:** Componentă UI — Notificare

**Scop:** Afișează un toast individual cu icon, mesaj și buton de închidere.

**Props:**

| Prop | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `message` | `string` | Da | `''` | Textul notificării |
| `type` | `'success' \| 'error' \| 'warning'` | Nu | `'success'` | Tipul notificării |

**Outputuri:**

| Output | Tip | Descriere |
|---|---|---|
| `close` | `EventEmitter<void>` | Emis când utilizatorul apasă butonul X |

**Computed:**
- `icon: string` — clasa FontAwesome: `fa-check-circle` / `fa-times-circle` / `fa-exclamation-triangle`
- `borderClass: string` — clase CSS: `border-success text-success` / `border-error` / `border-warning`

---

#### `YardlyToastContainerComponent` — Container Toast-uri

**Fișier:** `src/app/shared-ui/toast/yardly-toast-container/yardly-toast-container.component.ts`
**Selector:** `yardly-toast-container`
**Tip:** Componentă UI — Container Notificări

**Scop:** Gestionează ciclul de viață al toast-urilor: abonare la `ToastService`, animații de intrare/ieșire, auto-dispariție după 3 secunde.

**State intern:**
- `notifications: ToastInternal[]` — lista de toast-uri active cu starea `'enter' | 'leave'`

**Comportament:**
1. La primirea unui toast, îi setează `state: 'enter'` și îl adaugă la `notifications`
2. După 3000ms setează `state: 'leave'` (declanșează animația CSS)
3. După alte 900ms (durata animației) îl elimină din `notifications`
4. Utilizatorul poate închide manual cu butonul X (apelează `startLeaveAnimation`)

**Poziționare:** Fixed, centrat orizontal, jos (Bootstrap: `bottom-0 start-50 translate-middle-x mb-4`), `z-index: 1055`.

---

#### `YardlyInputComponent` — Dropdown Searchable Custom

**Fișier:** `src/app/shared-ui/yardly-input/yardly-input.component.ts`
**Selector:** `app-yardly-input`
**Tip:** Componentă UI — Input Custom

**Scop:** Dropdown custom cu funcționalitate de căutare, stare disabled, label și mesaj de eroare. Alternativă styled la `<select>` nativ.

**Props:**

| Prop | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `options` | `Option[]` | Da | `[]` | Lista de opțiuni disponibile |
| `value` | `string` | Nu | `''` | Valoarea selectată curent |
| `placeholder` | `string` | Nu | `'Selectați o opțiune...'` | Text placeholder |
| `searchable` | `boolean` | Nu | `true` | Activează câmpul de căutare în dropdown |
| `disabled` | `boolean` | Nu | `false` | Dezactivează dropdown-ul |
| `label` | `string` | Nu | `''` | Eticheta afișată deasupra dropdown-ului |
| `error` | `string` | Nu | `''` | Mesaj de eroare afișat sub dropdown |

**Outputuri:**

| Output | Tip | Descriere |
|---|---|---|
| `valueChange` | `EventEmitter<string>` | Emis când se selectează o opțiune, cu `value` al opțiunii |

**State intern:**
- `isOpen: boolean` — starea deschis/închis a dropdown-ului
- `searchTerm: string` — termenul de căutare curent
- `filteredOptions: Option[]` — opțiunile filtrate după `searchTerm`
- `selectedOption: Option | null` — opțiunea selectată

**Comportament:**
- Click în afara componentei închide dropdown-ul (`@HostListener('document:click')`)
- Opțiunile cu `disabled: true` nu pot fi selectate
- La selectare emite `valueChange` cu `option.value`
- Căutarea este case-insensitive

**`Option` interface:** `{ value: string, label: string, disabled?: boolean }`

---

### 3.9 Feature: Auth

#### `AuthStore` — Store Autentificare

**Fișier:** `src/app/features/auth/store/auth.store.ts`
**Tip:** NgRx SignalStore — providedIn root
**Scop:** Gestionează starea autentificării: utilizator curent, token JWT, status operație.

**State:**

| Câmp | Tip | Default | Descriere |
|---|---|---|---|
| `user` | `any \| null` | `null` | Utilizatorul autentificat |
| `token` | `string \| null` | din `localStorage` | Token-ul JWT curent |
| `status` | `'idle' \| 'loading' \| 'success' \| 'error'` | `'idle'` | Starea operației curente |
| `error` | `string \| null` | `null` | Mesajul de eroare |

**Metode:**

| Metodă | Parametri | Descriere |
|---|---|---|
| `loadMe()` | `void` | Apelează `GET /auth/me` pentru a restaura sesiunea din token existent |
| `login()` | `credentials: any` | Autentificare; la succes salvează token în localStorage și navighează în funcție de rol |
| `register()` | `dto: any` | Înregistrare; la succes salvează token și navighează la `/` |
| `forgotPassword()` | `email: string` | Trimitere email resetare parolă |
| `logout()` | — | Șterge token din localStorage, resetează starea, navighează la `/auth/login` |

**Navigare post-login:**
- `role === 'admin'` → `/admin/dashboard`
- `role === 'manager'` → `/manager/dashboard`
- altfel → `/`

---

#### `AuthFacade` — Facade Autentificare

**Fișier:** `src/app/features/auth/facades/auth.facade.ts`
**Tip:** Facade Pattern — providedIn root
**Scop:** Expune un ViewModel simplu și metode delegate pentru componentele UI, ascunzând detaliile store-ului.

**ViewModel (`vm`):**

| Proprietate | Tip | Descriere |
|---|---|---|
| `user` | `Signal<any>` | Utilizatorul curent |
| `status` | `Signal<string>` | Statusul operației |
| `error` | `Signal<string \| null>` | Eroarea curentă |
| `isLoggedIn` | `Signal<boolean>` | `computed(() => !!store.token())` |
| `isLoading` | `Signal<boolean>` | `computed(() => status === 'loading')` |

**Metode delegate:** `login()`, `register()`, `forgotPassword()`, `logout()`

---

#### `LoginComponent` — Pagina Login

**Fișier:** `src/app/features/auth/login/login.component.ts`
**Rută:** `/login`
**Scop:** Formular de autentificare cu validare reactivă, toggle vizibilitate parolă și butoane de quick-login pentru cont dev.

**State intern:**
- `showPassword: boolean` — vizibilitatea parolei
- `loginForm: FormGroup` — `{ email (required, email), password (required) }`

**Conturi dev (quick login):**
- User: `user1@yardly.ro` / `Password123!`
- Manager: `manager1@yardly.ro` / `Password123!`
- Admin: `admin@yardly.ro` / `Password123!`

**Metode:**

| Metodă | Descriere |
|---|---|
| `togglePassword()` | Comută vizibilitatea parolei |
| `quickLogin()` | Populează formularul și autentifică direct cu credențialele dev |
| `onSubmit()` | Validează formularul și apelează `authFacade.login()` |

---

#### `RegisterComponent` — Pagina Înregistrare

**Fișier:** `src/app/features/auth/register/register.component.ts`
**Rută:** `/register`
**Scop:** Formular de înregistrare cu selector rol (user/manager), validare și toggle parolă.

**State intern:**
- `showPassword: boolean`
- `registerForm: FormGroup` — `{ fullName (min 2), email, password (min 8), role ('user'), terms (required true) }`

**Metode:**

| Metodă | Descriere |
|---|---|
| `togglePassword()` | Comută vizibilitatea parolei |
| `setRole()` | Setează rolul `'user'` sau `'manager'` |
| `onSubmit()` | Validează și apelează `authFacade.register()` |

---

#### `ForgotPasswordComponent` — Recuperare Parolă

**Fișier:** `src/app/features/auth/forgot-password/forgot-password.component.ts`
**Rută:** `/forgot-password`
**Scop:** Formular simplu pentru trimiterea unui email de resetare a parolei.

**State intern:**
- `emailSent: boolean` — afișează mesaj de confirmare după trimitere
- `forgotForm: FormGroup` — `{ email (required, email) }`

**Notă:** Backend-ul nu implementează un endpoint real de forgot-password — request-ul va eșua cu 404. Componenta setează `emailSent = true` indiferent de răspuns (logică client-side), dar `authFacade.forgotPassword()` va actualiza starea cu `status: 'error'`.

---

### 3.10 Feature: Home

#### `HomeStore` — Store Homepage

**Fișier:** `src/app/features/home/store/home.store.ts`
**Tip:** NgRx SignalStore — providedIn root
**Scop:** Încarcă datele pentru homepage: primele 3 terenuri featured și toate sporturile disponibile.

**State:**

| Câmp | Tip | Descriere |
|---|---|---|
| `featuredFields` | `Field[]` | Primele 3 terenuri din API |
| `popularSports` | `Sport[]` | Toate sporturile |
| `loading` | `boolean` | Status loading |
| `error` | `string \| null` | Mesaj eroare |

**Metode:**

| Metodă | Descriere |
|---|---|
| `loadHomeData()` | Apelează în paralel `getAllFields()` și `getAll()` prin `forkJoin`, stochează `fields.slice(0, 3)` ca featured |

---

#### `HomeFacade` — Facade Homepage

**Fișier:** `src/app/features/home/facades/home.facade.ts`
**Tip:** Facade — providedIn root

**ViewModel (`vm`):** `featuredFields`, `popularSports`, `loading`, `error` (toate Signals din HomeStore)

**Metode:** `init()` — apelează `store.loadHomeData()`

---

#### `HomeComponent` — Pagina Principală

**Fișier:** `src/app/features/home/home.component.ts`
**Rută:** `/`
**Scop:** Pagina de start cu hero section, search bar, categorii sporturi, terenuri populare și CTA.

**State intern (Signals):**
- `selectedLocation: Signal<string>` — locația selectată (default: `'Bucuresti'`)
- `selectedDate: Signal<string>` — data selectată (default: `'Today'`)
- `selectedSport: Signal<string>` — sportul selectat (default: `'Soccer'`)

**Date statice:**
- `locations: string[]` — `['Bucuresti', 'Cluj-Napoca', 'Timișoara', 'Brașov', 'Iași']`
- `dates: string[]` — `['Today', 'Tomorrow', 'Select Date']`
- `sports: string[]` — `['Soccer', 'Tennis', 'Basketball', 'Padel']`

**Metode:**

| Metodă | Descriere |
|---|---|
| `getSportName()` | Rezolvă ID sport la nume din `facade.vm.popularSports()` |
| `onSearch()` | Placeholder — logghează în consolă (neimplementat complet) |
| `onBook()` | Placeholder — loghează în consolă (navigarea se face din `CardComponent`) |

**Inițializare:** `constructor()` apelează `facade.init()` care triggherează `loadHomeData()`.

---

### 3.11 Feature: Fields List

#### `FieldsListComponent` — Lista Terenuri

**Fișier:** `src/app/features/fields-list/fields-list.component.ts`
**Rută:** `/fields`
**Scop:** Afișează toate terenurile disponibile cu filtrare client-side multi-criteriu: sport, locație, preț, disponibilitate.

**Dependențe injectate:** `Router`, `FieldsStore`, `SportsStore`, `CitiesStore`

**State intern (Signals):**
- `selectedSport: Signal<string>` — sportul filtrat (default: `'toate'`)
- `selectedLocation: Signal<string>` — locația filtrată (default: `'Toate locațiile'`)
- `selectedPrice: Signal<PriceRange>` — intervalul de preț selectat
- `selectedAvailability: Signal<string>` — disponibilitatea filtrată (default: `'Toate'`)

**Computed:**
- `filteredFields: Signal<Field[]>` — terenurile filtrate reactiv pe baza tuturor filtrelor

**Logica filtrării:**
1. Sport: caută în `SportsStore` numele sportului după ID, compară cu filtrul
2. Locație: caută în `CitiesStore` numele orașului după ID, compară cu filtrul
3. Preț: verifică `field.pricePerHour` între `min` și `max`
4. Disponibilitate: compară `field.status` cu filtrul (lowercase)

**Opțiuni preț (`PriceRange`):**

| Label | Min | Max |
|---|---|---|
| Orice preț | 0 | ∞ |
| Sub 50 RON | 0 | 50 |
| 50–100 RON | 50 | 100 |
| 100–150 RON | 100 | 150 |
| Peste 150 RON | 150 | ∞ |

**Inițializare:** `constructor()` apelează `loadSports()`, `loadCities()`, `loadFields()`.

---

### 3.12 Feature: Field Details

#### `FieldDetailsComponent` — Detalii Teren

**Fișier:** `src/app/features/field-details/field-details.component.ts`
**Rută:** `/field-details/:id`
**Scop:** Pagina de detalii a unui teren cu galerie imagini, informații, calendar de disponibilitate, selecție slot și formular de rezervare cu breakdown de preț.

**Dependențe injectate:** `ActivatedRoute`, `Router`, `FieldsStore`, `SportsStore`, `ReservationsStore`, `ReservationsService`

**State intern:**

| Câmp | Tip | Descriere |
|---|---|---|
| `field: Signal<Field \| null>` | — | Terenul curent (computed din store după id din URL) |
| `calendarDays: CalendarDay[]` | — | Zilele lunii curente generate manual |
| `currentYear, currentMonth` | `number` | Luna curentă afișată în calendar |
| `selectedDate: Signal<string>` | — | Data selectată (format `YYYY-MM-DD`) |
| `selectedTime: Signal<string>` | — | Slot-ul orar selectat |
| `selectedDuration: Signal<string>` | — | Durata selectată |
| `availableSlots: Signal<{from,to}[]>` | — | Sloturile disponibile pentru data selectată |

**Computed:**
- `serviceFee` — 7% din `pricePerHour * durationInHours`
- `total` — `pricePerHour * hours + serviceFee`

**Metode:**

| Metodă | Descriere |
|---|---|
| `generateCalendar()` | Construiește array-ul `calendarDays` pentru luna curentă |
| `onDaySelect()` | Setează data selectată și apelează `ReservationsService.getAvailableSlots()` |
| `onTimeSelect()` | Setează slot-ul orar selectat |
| `onDurationSelect()` | Setează durata și reîncarcă sloturile disponibile |
| `reserve()` | Apelează `ReservationsStore.createReservation()` cu datele formularului |
| `prevMonth() / nextMonth()` | Navighează în calendar |

**`facilityIcons`:** Map cu iconuri Material Symbols pentru: Vestiare, Parcare, Iluminat nocturn, WiFi, Tribuna, Bar/Cafenea etc.

---

### 3.13 Feature: Reservations

#### `ReservationsComponent` — Pagina Rezervări

**Fișier:** `src/app/features/reservations/reservations.component.ts`
**Rută:** `/reservations`
**Scop:** Formular complex de rezervare cu calendar lunar interactiv, selecție sport/teren/durată și afișare sloturi disponibile. Suportă atât view desktop (calendar complet) cât și mobile (navigare zi cu zi).

**Dependențe injectate:** `FormBuilder`, `AuthStore`, `FieldsStore`, `SportsStore`, `ReservationsStore`, `ToastService`

**State intern:**
- `bookingForm: FormGroup` — `{ sport, time, field, date, duration, isEvent, isRecurrent }`
- `calendarDays: CalendarDay[]` — zilele lunii cu metadate (isPast, isToday, isOpen, isCurrentMonth)
- `currentYear, currentMonth: number` — luna afișată în calendar
- `isMobile: boolean` — mod de afișare
- `selectedDay: Date` — ziua selectată în mod mobil
- `durationOptions, sportsOptions$, fieldsOptions$, filteredFieldsOptions$` — opțiunile pentru selecturi

**Observabile:**
- `sports$, fields$` — din store-uri via `toObservable()`
- `slots$, loadingSlots$` — sloturile disponibile și loading-ul lor

**Metode principale:**

| Metodă | Descriere |
|---|---|
| `filterFieldsBySport()` | Filtrează opțiunile de terenuri pe baza sportului selectat |
| `generateDurationOptions()` | Generează opțiunile de durată în funcție de programul terenului (max ore disponibile) |
| `generateCalendar()` | Construiește calendarul lunar cu metadate pentru fiecare zi |
| `onDaySelected()` | Selectează o zi în calendar, actualizează formularul, încarcă sloturile |
| `checkAvailability()` | Apelează API-ul de sloturi disponibile dacă formularul este complet |
| `reserve()` | Creează rezervarea prin `ReservationsStore` |
| `getTotalPrice()` | Calculează prețul total (ore × preț/oră) |
| `prevMonth() / nextMonth()` | Navigare calendar |
| `prevDay() / nextDay()` | Navigare zi cu zi (mod mobil) |

---

### 3.14 Feature: Booking Confirmation

#### `BookingConfirmationComponent` — Confirmare Rezervare

**Fișier:** `src/app/features/booking-confirmation/booking-confirmation.component.ts`
**Rută:** `/booking-confirmation`
**Scop:** Pagina de succes afișată după crearea unei rezervări. Permite partajarea linkului de joc, adăugarea în calendar Google și navigarea la profilul utilizatorului.

**Date afișate (computed din store):**
- `reservation: Signal<Reservation>` — ultima rezervare creată (din `ReservationsStore.selectedReservation`)
- `field: Signal<Field>` — terenul rezervat (din `FieldsStore`)
- `sportName: Signal<string>` — numele sportului
- `bookingId: Signal<string>` — ID-ul rezervării

**Metode:**

| Metodă | Descriere |
|---|---|
| `copyLink()` | Copiază link-ul de share în clipboard via `navigator.clipboard.writeText()` |
| `shareWhatsApp()` | Deschide WhatsApp Web cu linkul pre-completat |
| `shareMessenger()` | Deschide Messenger cu linkul pre-completat |
| `addToCalendar()` | Deschide Google Calendar cu evenimentul pre-completat |
| `buildGCalUrl()` | Construiește URL-ul Google Calendar cu parametri (dată, oră, titlu, locație) |

---

### 3.15 Feature: Booking Details

#### `BookingDetailsComponent` — Detalii Rezervare

**Fișier:** `src/app/features/booking-details/booking-details.component.ts`
**Rută:** `/booking-details/:id`
**Scop:** Pagina detaliată a unei rezervări individuale cu status, informații teren, opțiuni de partajare, anulare și descărcare chitanță.

**State intern:**
- `reservation: Signal<Reservation>` — rezervarea din URL param `:id`
- `field: Signal<Field>` — terenul asociat
- `sportName: Signal<string>` — numele sportului
- `bookingStatus: Signal<string>` — statusul calculat al rezervării
- `showCancelConfirm: boolean` — afișare modal confirmare anulare

**Metode:**

| Metodă | Descriere |
|---|---|
| `copyLink()` | Copiază link de share în clipboard |
| `shareNative()` | Folosește Web Share API (`navigator.share`) dacă este disponibil |
| `openMessage()` | Deschide SMS cu link pre-completat |
| `addToCalendar()` | Adaugă în Google Calendar |
| `downloadReceipt()` | Generează un HTML blob cu chitanța și îl descarcă ca fișier |
| `cancelBooking()` | Afișează modal de confirmare anulare |
| `confirmCancel()` | Șterge rezervarea prin `ReservationsStore.deleteReservation()` |
| `dismissCancel()` | Închide modal-ul de confirmare |
| `contactSupport()` | Deschide email client cu adresa support |

---

### 3.16 Feature: Join Game

#### `JoinGameComponent` — Alătură-te unui Joc

**Fișier:** `src/app/features/join-game/join-game.component.ts`
**Rută:** `/join/:code`
**Scop:** Pagina publică pentru alăturarea la un meci (prin link de invitație). Afișează detalii meci, jucători înscriși și formular de alăturare.

**Stare:** Toate datele sunt **hardcodate** (mock). Nu există integrare cu backend.

**Date mock:**
- `game` — titlu, locație, orar, sport, intensitate, preț/jucător
- `players: Player[]` — lista jucătorilor înscriși (avataruri de la pravatar.cc)
- `maxPlayers: 10`, `joining: boolean`, `joined: boolean`

**Metode:** `joinMatch()` (simulează un timeout de 1.2s), `copyLink()`, `shareEmail()`, `shareMessage()`, `showQR()`, `viewMap()`

---

### 3.17 Feature: User Profile

#### `UserProfileComponent` — Profil Utilizator

**Fișier:** `src/app/features/user-profile/user-profile.component.ts`
**Rută:** `/profile`
**Scop:** Pagina de profil a utilizatorului autentificat cu statistici, rezervările mele (upcoming/history) și conținut placeholder pentru recenzii și terenuri favorite.

**State intern:**
- `activeTab: 'upcoming' | 'history' | 'reviews' | 'favorites'` — tab-ul activ

**Computed (Signals):**
- `myReservations` — din `ReservationsStore.reservations`
- `upcomingBookings` — rezervări cu dată în viitor
- `historyBookings` — rezervări cu dată în trecut sau dată de azi
- `filteredBookings` — rezervările pentru tab-ul activ
- Stats: `totalBookings`, `hoursPlayed` (calculat din durate), `memberLevel`

**Metode helper:**

| Metodă | Descriere |
|---|---|
| `getFieldName() / getFieldCity() / getFieldId()` | Rezolvă câmpul `field` (poate fi string sau obiect populated) |
| `getBookingStatus()` | Determină statusul: `upcoming` / `completed` / `cancelled` |
| `calcHoursPlayed()` | Sumează orele rezervate din lista de rezervări |

**Notă:** Terenurile favorite și recenziile sunt date hardcodate (placeholder).

---

### 3.18 Feature: Manager Portal

#### `ManagerLayoutComponent` — Layout Manager

**Fișier:** `src/app/features/manager/layout/manager-layout.component.ts`
**Scop:** Shell-ul portalului manager cu sidebar de navigație. Afișează logo, meniu lateral și informațiile utilizatorului curent.

**Navigație:**

| Item | Rută | Iconiță |
|---|---|---|
| Overview | `/manager/dashboard` | `dashboard` |
| Fields | `/manager/fields` | `sports_soccer` |
| Reservations | `/manager/reservations` | `calendar_month` |
| Analytics | `/manager/analytics` | `bar_chart` |
| Settings | `/manager/settings` | `settings` |

---

#### `ManagerDashboardComponent` — Dashboard Manager

**Fișier:** `src/app/features/manager/dashboard/manager-dashboard.component.ts`
**Rută:** `/manager/dashboard`
**Scop:** Pagina principală a portalului manager cu statistici de business și vizualizare rapidă.

**Date:**
- **Stats (hardcodate):** Revenue Today, Revenue Month, Bookings Today, Utilization Rate
- **Quick Actions:** Add New Field, Invite Staff, Duplicate Schedule, Export Reports
- **Rezervări recente:** Din `ReservationsStore` (ultimele 5)
- **Terenuri mele:** Din `FieldsStore` filtrate pe `userId` managerului (max 2)

---

#### `ManagerFieldsComponent` — Terenurile Mele

**Fișier:** `src/app/features/manager/fields/manager-fields.component.ts`
**Rută:** `/manager/fields`
**Scop:** Gestionarea terenurilor aparținând managerului autentificat.

**State intern:**
- `viewMode: 'grid' | 'list'` — modul de vizualizare
- `managerFields: Signal<Field[]>` — computed filtrat pe `userId` din `authStore`

**Date hardcodate:** Stats: Total Fields, Avg Rating, Active Fields, Field Revenue

---

#### `FieldEditorComponent` — Editor Teren

**Fișier:** `src/app/features/manager/field-editor/field-editor.component.ts`
**Rută:** `/manager/field-editor`
**Scop:** Formular de creare/editare teren cu previzualizare live și drop zone pentru imagini.

**State intern:**
- `form: { displayName, sportType, surfaceType, hourlyRate, minBooking }`
- `listingHealth: number` — 80 (hardcodat) — scorul de completare al listingului
- Handlers drag&drop: `onDragOver()`, `onDragLeave()`, `onDrop()`

**Notă:** Metodele `onSaveDraft()` și `onPublish()` sunt placeholder-uri goale. Formularul nu este integrat cu backend-ul.

---

#### `ManagerReservationsComponent` — Rezervări Manager

**Fișier:** `src/app/features/manager/reservations/manager-reservations.component.ts`
**Rută:** `/manager/reservations`
**Scop:** Vizualizarea și gestionarea tuturor rezervărilor pentru terenurile managerului.

**Filtrare:**
- `StatusFilter: 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'`
- `searchQuery: string` — căutare după nume utilizator/teren
- `selectedField: string` — filtru după teren

**Computed:**
- `filteredReservations` — rezervări filtrate după status, teren și query
- Stats: Total, Confirmed, Pending, Monthly Revenue

**Metode:** `formatDuration(d: string): string`, `toDisplay()` (mapare la `DisplayReservation`)

---

#### `ManagerAnalyticsComponent` — Analitics Manager

**Fișier:** `src/app/features/manager/analytics/manager-analytics.component.ts`
**Rută:** `/manager/analytics`
**Scop:** Dashboard de analitics cu grafice de venituri, distribuție sporturi, performanță terenuri și heatmap ore de vârf.

**Notă:** Toate datele sunt **100% hardcodate** (mock). Nu există integrare cu API.

**Date:**
- `activePeriod: 'week' | 'month' | 'year'`
- `revenueData` — 12 luni cu valori și procente pentru graficul de bare
- `sportsData` — Soccer 46%, Basketball 24%, Tennis 18%, Padel 12%
- `topFields` — 5 terenuri cu bookings, revenue, utilization, trend
- `heatmap` — matrice 9×7 (ore 6am-10pm × zile Mon-Sun), valori 1-5

---

#### `ManagerSettingsComponent` — Setări Manager

**Fișier:** `src/app/features/manager/settings/manager-settings.component.ts`
**Rută:** `/manager/settings`
**Scop:** Setări profil, venue, notificări și billing pentru manager.

**Tabs:**
- `profile` — informații personale (populat din `authFacade`)
- `venue` — detalii locație și program
- `notifications` — toggle-uri email/push/SMS
- `billing` — plan Pro $49/month, Visa 4242

**State intern:** `saved: Signal<boolean>` — afișează feedback vizual de salvare, resetat după 2.5s.

---

### 3.19 Feature: Admin Portal

#### `AdminLayoutComponent` — Layout Admin

**Fișier:** `src/app/features/admin/layout/admin-layout.component.ts`
**Scop:** Shell-ul portalului admin cu sidebar, 7 link-uri de navigație, Storage Usage bar și Export Reports.

**Navigație:**

| Item | Rută |
|---|---|
| Dashboard | `/admin/dashboard` |
| Users | `/admin/users` |
| Managers | `/admin/managers` |
| Fields | `/admin/fields` |
| Disputes | `/admin/disputes` |
| Bookings | `/admin/bookings` |
| Finances | `/admin/finances` |

---

#### `AdminDashboardComponent` — Dashboard Admin

**Fișier:** `src/app/features/admin/dashboard/admin-dashboard.component.ts`
**Rută:** `/admin/dashboard`
**Scop:** Dashboard global al platformei cu KPI-uri, grafice de bookings și revenue, top cities și acțiuni rapide.

**Date (hardcodate):**
- **KPI-uri:** Total Users 12,840 / Managers 450 / Fields 1,200 / Bookings 8,500 / Revenue $142k / Cities 24
- **Top Cities:** London, New York, Barcelona
- **Recent Activity:** 4 items (Manager nou, Dispute, Field aprobat, Config sistem)
- **Pending Approvals:** 2 items cu butoane Approve/Reject

---

#### `AdminUsersComponent` — Gestionare Utilizatori

**Fișier:** `src/app/features/admin/users/admin-users.component.ts`
**Rută:** `/admin/users`
**Scop:** Tabel cu toți utilizatorii platformei, filtrare, blocarea utilizatorilor și panoul de insights.

**Date:** 4 utilizatori hardcodați (mock)
**Filtrare:** `'all' | 'active' | 'blocked'` + `searchQuery`
**Metode:** `selectUser()` (toggle panou lateral), `blockUser()` (toggle status `active/blocked`)

---

#### `AdminManagersComponent` — Gestionare Manageri

**Fișier:** `src/app/features/admin/managers/admin-managers.component.ts`
**Rută:** `/admin/managers`
**Scop:** Tabel manageri activi și panoul de verificare manageri pending cu documente.

**Date:** 3 manageri pending + 4 manageri activi (hardcodate)
**Metode:** `selectManager()`, `approveManager()` (elimină din lista pending)

---

#### `AdminFieldsComponent` — Moderare Terenuri

**Fișier:** `src/app/features/admin/fields/admin-fields.component.ts`
**Rută:** `/admin/fields`
**Scop:** Moderare terenuri nou înregistrate (Approve/Reject) și inventarul complet al terenurilor.

**Date:** 2 terenuri pending + 5 în inventar (hardcodate)
**Metode:** `approve() / reject()`, `selectField()`, `closePanel()`

---

#### `AdminCitiesComponent` — Gestionare Orașe

**Fișier:** `src/app/features/admin/cities/admin-cities.component.ts`
**Rută:** `/admin/cities`
**Scop:** Tabel cu toate orașele platformei și panou lateral cu detalii, trend booking și activitate recentă.

**Date:** 6 orașe hardcodate (London, New York, Paris, Berlin, Tokyo, Madrid)
**Filtrare:** `'All Cities' | 'Active' | 'Inactive'`

---

#### `AdminBookingsComponent` — Rezervări Admin

**Fișier:** `src/app/features/admin/bookings/admin-bookings.component.ts`
**Rută:** `/admin/bookings`
**Scop:** Vizualizare și gestionare toate rezervările platformei cu filtre multiple și panou detalii.

**Date:** 4 rezervări hardcodate (mock) cu statusuri CONFIRMED/PENDING/CANCELLED
**Filtrare:** Status, City, Manager, Sport, Date

---

#### `AdminDisputesComponent` — Dispute

**Fișier:** `src/app/features/admin/disputes/admin-disputes.component.ts`
**Rută:** `/admin/disputes`
**Scop:** Gestionarea disputelor între utilizatori și manageri. Vizualizare complaint + răspuns manager + timeline.

**Date:** 4 dispute hardcodate cu statusuri CONFIRMED/PENDING/REVIEWING/RESOLVED
**Metode:** `selectDispute()`, `closePanel()`, `getStatusClass()`

---

#### `AdminFinancesComponent` — Finanțe (Stub)

**Fișier:** `src/app/features/admin/finances/admin-finances.component.ts`
**Rută:** `/admin/finances`
**Scop:** Pagina placeholder pentru funcționalitate de finanțe neimplementată.
**Template:** Inline — afișează iconiță `payments` + titlu "Finances" + descriere.

---

#### `AdminSettingsComponent` — Setări Admin (Stub)

**Fișier:** `src/app/features/admin/settings/admin-settings.component.ts`
**Rută:** `/admin/settings`
**Scop:** Pagina placeholder pentru setări admin neimplementate.
**Template:** Inline — afișează iconiță `settings` + titlu "Settings" + descriere.

---

## 4. Modele de Date

### User

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | ID MongoDB generat automat |
| `email` | `string` | Da | — | Email unic |
| `password` | `string` | Da | — | Parolă hashată bcrypt |
| `username` | `string` | Da | — | Numele de display |
| `role` | `'user' \| 'admin' \| 'manager'` | Nu | `'user'` | Rolul în platformă |
| `phone` | `string` | Nu | — | Număr de telefon |
| `createdAt` | `Date` | auto | — | Data creării |
| `updatedAt` | `Date` | auto | — | Data ultimei modificări |

**Relații:** Referit în Field (câmp `manager`) și Reservation (câmp `user`)

---

### Field (Teren)

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | ID MongoDB |
| `name` | `string` | Da | — | Numele terenului |
| `sport` | `ObjectId` → Sport | Da | — | Tipul de sport |
| `address` | `string` | Da | — | Adresa fizică |
| `locationUrl` | `string` | Nu | — | Link Google Maps |
| `description` | `string` | Nu | — | Descriere |
| `capacity` | `number` | Nu | — | Capacitate jucători |
| `city` | `ObjectId` → City | Da | — | Orașul |
| `pricePerHour` | `number` | Da | — | Prețul/oră (RON) |
| `schedule` | `[{ day, from, to }]` | Nu | `[]` | Program pe zile |
| `images` | `string[]` | Nu | `[]` | Căi imagini uploadate |
| `facilities` | `string[]` | Nu | `[]` | Facilități disponibile |
| `averageRating` | `number` | Nu | `0` | Rating mediu (0–5) |
| `status` | `string` | Nu | `''` | `available` / `limited` / `full` |
| `manager` | `ObjectId` → User | Da | — | Managerul responsabil |
| `createdAt` | `Date` | auto | — | Data creării |

**Relații:** Referit în Reservation (câmp `field`)

---

### Reservation (Rezervare)

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | ID MongoDB |
| `field` | `ObjectId` → Field | Da | — | Terenul rezervat |
| `user` | `ObjectId` → User | Da | — | Utilizatorul care rezervă |
| `date` | `string` | Da | — | Data (format `YYYY-MM-DD`) |
| `time` | `string` | Da | — | Ora de start (format `HH:MM`) |
| `duration` | `string` | Da | — | Durată: `"1h"`, `"1h30"`, `"2h"` etc. |
| `isEvent` | `boolean` | Nu | `false` | Este eveniment public? |
| `isRecurrent` | `boolean` | Nu | `false` | Este recurentă? |
| `slots` | `[{ from, to }]` | Nu | `[]` | Sloturi de 30 min generate automat |

---

### Sport

| Câmp | Tip | Required | Descriere |
|---|---|---|---|
| `_id` | `ObjectId` | auto | ID MongoDB |
| `name` | `string` | Da | Numele sportului (unic) |
| `icon` | `string` | Da | Calea iconului uploadat |

**Relații:** Referit în Field (câmp `sport`)

---

### City (Oraș)

| Câmp | Tip | Required | Default | Descriere |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | ID MongoDB |
| `name` | `string` | Da | — | Numele orașului |
| `country` | `string` | Da | — | Țara |
| `isActive` | `boolean` | Nu | `true` | Flag soft delete |

**Relații:** Referit în Field (câmp `city`)

---

## 5. Sumar Endpoint-uri API

| Metodă | Cale | Controller | Descriere | Autentificare | Roluri |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | AuthController | Înregistrare utilizator nou | Nu | — |
| `POST` | `/auth/login` | AuthController | Autentificare cu email+parolă | Nu | — |
| `GET` | `/auth/me` | AuthController | Utilizatorul curent | JWT | — |
| `GET` | `/users` | UsersController | Toți utilizatorii | JWT | admin |
| `GET` | `/users/:id` | UsersController | Utilizator după ID | JWT | — |
| `PATCH` | `/users/:id` | UsersController | Actualizare utilizator | JWT | owner / admin |
| `DELETE` | `/users/:id` | UsersController | Ștergere utilizator | JWT | admin |
| `GET` | `/fields` | FieldsController | Toate terenurile | Nu | — |
| `POST` | `/fields` | FieldsController | Creare teren (cu imagini) | JWT | manager, admin |
| `GET` | `/fields/:id` | FieldsController | Teren după ID | Nu | — |
| `PATCH` | `/fields/:id` | FieldsController | Actualizare teren | JWT | manager, admin |
| `DELETE` | `/fields/:id` | FieldsController | Ștergere teren | JWT | manager, admin |
| `GET` | `/reservations/availability` | ReservationsController | Sloturi disponibile | Nu | — |
| `GET` | `/reservations` | ReservationsController | Toate rezervările | JWT | admin |
| `POST` | `/reservations` | ReservationsController | Creare rezervare | JWT | — |
| `GET` | `/reservations/my` | ReservationsController | Rezervările mele | JWT | — |
| `GET` | `/reservations/:id` | ReservationsController | Rezervare după ID | JWT | — |
| `PATCH` | `/reservations/:id` | ReservationsController | Actualizare rezervare | JWT | — |
| `DELETE` | `/reservations/:id` | ReservationsController | Ștergere rezervare | JWT | — |
| `GET` | `/sports` | SportsController | Toate sporturile | Nu | — |
| `POST` | `/sports` | SportsController | Creare sport (cu icon) | JWT | admin |
| `GET` | `/sports/:id` | SportsController | Sport după ID | Nu | — |
| `PATCH` | `/sports/:id` | SportsController | Actualizare sport | JWT | admin |
| `DELETE` | `/sports/:id` | SportsController | Ștergere sport | JWT | admin |
| `GET` | `/cities` | CityController | Toate orașele active | Nu | — |
| `POST` | `/cities` | CityController | Creare oraș | JWT | admin |
| `GET` | `/cities/:id` | CityController | Oraș după ID | Nu | — |
| `PATCH` | `/cities/:id` | CityController | Actualizare oraș | JWT | admin |
| `DELETE` | `/cities/:id` | CityController | Soft delete oraș | JWT | admin |

---

## 6. Aspecte Transversale

### Guards

#### Backend

| Guard | Fișier | Funcție | Aplicare |
|---|---|---|---|
| `JwtAuthGuard` | `auth/guards/jwt-auth.guard.ts` | Verifică prezența și validitatea JWT Bearer token | `@UseGuards(JwtAuthGuard)` pe metode sau controllere |
| `RolesGuard` | `auth/guards/roles.guard.ts` | Verifică că rolul utilizatorului (`req.user.role`) este în lista rolurilor cerute via `@Roles()` | `@UseGuards(JwtAuthGuard, RolesGuard)` împreună cu `@Roles('admin')` |

**Notă importantă:** `RolesGuard` trebuie utilizat **întotdeauna împreună** cu `JwtAuthGuard` (ordinea contează — JWT se execută primul pentru a popula `req.user`).

#### Frontend

| Guard | Fișier | Funcție | Status |
|---|---|---|---|
| `authGuard` | `core/guards/auth.guards.ts` | Redirectează la `/auth/login` dacă nu este autentificat | Definit, neaplicat pe rute |
| `guestGuard` | `core/guards/auth.guards.ts` | Redirectează la `/` dacă este deja autentificat | Definit, neaplicat pe rute |

**Notă:** Gards-urile frontend sunt definite dar **nu sunt aplicate** pe rutele din `app.routes.ts` în configurația curentă. Portalurile manager și admin sunt accesibile fără verificare de rol pe frontend.

---

### Interceptori

#### Backend

Nu există interceptori globali configurați în NestJS.

#### Frontend

| Interceptor | Fișier | Funcție |
|---|---|---|
| `authInterceptor` | `core/interceptors/auth.interceptor.ts` | Adaugă `Authorization: Bearer <token>` la toate request-urile HTTP. SSR-safe (ignoră la server-side rendering). |

---

### Pipes & Validare

#### Backend

Validarea DTO-urilor folosește `class-validator` + `class-transformer`:

| Decorator | Utilizare |
|---|---|
| `@IsString()` | Validare tip string |
| `@IsNotEmpty()` | Câmp obligatoriu |
| `@IsEmail()` | Format email valid |
| `@MinLength(n)` | Lungime minimă |
| `@IsNumber()` | Validare tip number |
| `@IsArray()` | Validare array |
| `@IsOptional()` | Câmp opțional |
| `@IsMongoId()` | ID MongoDB valid (24 hex chars) |
| `@ValidateNested({ each: true })` | Validare obiecte nested în array |
| `@Type(() => ScheduleDto)` | Transformare tip pentru nested objects |

**Notă:** `ValidationPipe` global nu este configurat explicit în `main.ts`. DTO-urile sunt definite dar `@Body() dto: any` este folosit în unele controllere, ocolind validarea.

#### Frontend

| Pipe | Fișier | Transformare |
|---|---|---|
| `ImageUrlPipe` | `core/pipe/image.pipe.ts` | Cale relativă → URL absolut API |
| `EntityNamePipe` | `core/pipe/entityName.pipe.ts` | ID entitate → Nume din NgRx Store |

---

### Middleware

Nu există middleware global configurat în NestJS (`app.use()`). Funcționalitățile transversale sunt implementate prin Guards și Interceptori.

---

### Gestionare Globală a Erorilor

#### Backend

Nu există un `ExceptionFilter` global. Erorile sunt gestionate:
- La nivel de serviciu: aruncă `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException` — NestJS le convertește automat la răspunsuri HTTP corespunzătoare
- Excepțiile Mongoose (ex: document not found) nu sunt capturate uniform

#### Frontend

Erorile din store-uri sunt capturate cu `catchError` în fiecare `rxMethod` și stocate în câmpul `error` al state-ului. Nu există un handler global de erori Angular (`ErrorHandler`). Toast-urile de eroare sunt afișate manual în componente.

---

## 7. Configurație & Environment

### Backend — `.env`

| Variabilă | Obligatorie | Descriere | Valoare Default |
|---|---|---|---|
| `MONGODB_URI` | Da | URI conexiune MongoDB | `mongodb://localhost:27017/yardly` |
| `JWT_SECRET` | Da | Secretul pentru semnarea JWT | — (fără default) |
| `JWT_EXPIRES_IN` | Nu | Durata de valabilitate a JWT | `'1d'` |
| `PORT` | Nu | Port-ul serverului NestJS | `3000` |

### Frontend — `environments/`

**`enviroment.ts`** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

**`environment-prod.ts`** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: '...' // URL production
};
```

---

## 8. Stiluri & Design System

### Teme (Dark / Light)

Aplicația suportă două teme comutate prin atributul `data-theme` pe `<html>`.

**Tema Dark (default):**

| Token CSS | Valoare | Utilizare |
|---|---|---|
| `--yardly-bg` | `#072A1C` | Background principal |
| `--yardly-nav-bg` | `#021e0c` | Background navbar |
| `--yardly-bg-card` | `#114D31` | Background carduri |
| `--yardly-hover` | `#1a5e3d` | Background hover |
| `--yardly-border` | `#1a5e3d` | Culoare borduri |
| `--yardly-accent` | `#39E819` | Verde accent (brand color) |
| `--yardly-accent-soft` | `#57E439` | Verde accent deschis |
| `--yardly-text` | `#ffffff` | Text principal |
| `--yardly-muted` | `#8ba98b` | Text secundar |
| `--yardly-danger` | `#C34040` | Culoare eroare/pericol |
| `--yardly-available` | `#A3E635` | Status disponibil |

**Tema Light:**

| Token CSS | Valoare |
|---|---|
| `--yardly-bg` | `#F1F5F9` |
| `--yardly-nav-bg` | `#ffffff` |
| `--yardly-bg-card` | `#ffffff` |
| `--yardly-border` | `#E2E8F0` |
| `--yardly-accent` | `#32CD32` |
| `--yardly-text` | `#0F172A` |
| `--yardly-muted` | `#64748B` |

### Variabile SCSS

**Fișier:** `src/styles/_variables.scss`

| Variabilă | Valoare | Utilizare |
|---|---|---|
| `$nav-height` | `70px` | Înălțimea navbar-ului |
| `$font-family` | `'Lexend', 'Inter', sans-serif` | Font principal |
| `$radius-sm` | `0.375rem` | Border radius mic |
| `$radius-md` | `0.75rem` | Border radius mediu |
| `$radius-lg` | `1rem` | Border radius mare |
| `$radius-xl` | `1.5rem` | Border radius extra large |
| `$transition-base` | `all 0.3s ease` | Tranziție standard |
| `$transition-fast` | `all 0.15s ease` | Tranziție rapidă |

### Tokens de culoare SCSS

**Fișier:** `src/styles/_colors.scss`

| Variabilă | Valoare | Utilizare |
|---|---|---|
| `$accent` | `#39E819` | Verde brand (dark theme) |
| `$accent-soft` | `#57E439` | Verde deschis |
| `$accent-dark` | `#32CD32` | Verde brand (light theme) |
| `$danger` | `#C34040` | Erori și stări periculoase |
| `$warning` | `#f4c430` | Avertismente |
| `$info` | `#29b6f6` | Informații |
| `$available` | `#A3E635` | Status disponibil |
| `$unavailable` | `#C34040` | Status indisponibil |

### Clase CSS Utilitare (globale)

```scss
.bg-yardly          // background principal
.bg-yardly-card     // background card
.bg-accent          // background accent verde
.text-accent        // text verde accent
.text-accent-soft   // text verde deschis
.text-yardly        // text principal
.text-yardly-muted  // text secundar
.border-yardly      // bordură standard
.border-accent      // bordură verde accent
.btn-yardly-primary // buton principal (verde, text închis, bold)
.btn-yardly-outline // buton outline (bordură verde, transparent)
.yardly-card        // card standard cu bg, border, radius, transition
```

### Dependențe externe UI

| Librărie | Versiune | Utilizare |
|---|---|---|
| Bootstrap | 5.3 | Grid, utilitare CSS, componente de bază |
| FontAwesome | 6 | Iconițe (fa-solid, fa-check-circle etc.) |
| Material Symbols | (CDN) | Iconițe moderne (location_on, star, calendar_month etc.) |

---

*Documentație generată pentru proiectul Yardly — Platformă rezervare terenuri sportive*
*Backend: NestJS 11 + MongoDB | Frontend: Angular 19.2 + NgRx Signals*
