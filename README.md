<div align="center">
  <img src="./assets/icon.png" alt="PureScan Foods Logo" width="120" />
  
  # PureScan Foods
  **The Intelligent Food Scanner & Ingredient Analyzer**
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/EXPO-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)
</div>

<br />

## 📖 Overview
**PureScan Foods** is a cross-platform mobile application that empowers users to make conscious, healthy dietary choices. By simply scanning a barcode or capturing an image of an ingredient list, the app reveals potential allergens, checks dietary compatibility (Keto, Vegan, Gluten-Free, etc.), and explains complex E-codes using AI.

## ✨ Key Features
- **📸 Smart Scanning:** Instantly analyze products via barcode or by taking a photo of the ingredient text via OCR & AI.
- **🛡️ Family Profiles:** Manage dietary preferences and allergen sensitivities for the whole family under a single account.
- **🧠 AI Guru Assistant:** Chat with an advanced AI (Gemini 2.5 Flash) trained specifically on food science and ingredient toxicology for context-aware Q&A.
- **📚 Additive Encyclopedia:** Browse an extensive offline-ready database of E-codes, complete with risk filters, FDA/EU bans, and origin data.
- **📊 Compatibility Scoring:** Get a personalized "Safety & Compatibility Score" based on your exact dietary restrictions and health goals.
- **🌍 Localization:** Fully translated (i18n) and tailored for regional nutritional standards (Nutri-Score).

## 🛠 Tech Stack
| Category       | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Frontend**   | React Native, Expo, NativeWind (Tailwind CSS), Expo Router                |
| **Backend**    | Firebase (Auth, Firestore, Storage, Cloud Functions)                      |
| **AI Engine**  | Google Gemini 2.5 Flash API (Proxied securely via Firebase Functions)     |
| **External APIs**| OpenFoodFacts API (Barcode dataset lookup)                              |
| **State/Storage**| React Context, AsyncStorage (Persistent local storage)                  |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A Firebase project with Firestore, Auth, Storage, and Functions enabled.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AhmetDemiroglu/PureScanFoods.git
   cd PureScanFoods
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the Application:**
   ```bash
   npx expo start
   ```
   Press `a` for Android, `i` for iOS, or scan the QR code with the Expo Go app.

## 🏗 Architecture & Philosophy
Following a strict **"Smart Parent / Dumb Child"** architecture:
- **UI Components (`/components/ui`)** are highly decoupled, declarative, and largely stateless.
- **Logic & Providers (`/lib`, `/context`)** handle all external communications and state orchestration. API fetchers strictly return raw responses, with formatting and mapping handled deliberately by business logic blocks.
- **Code Cleanliness:** Functions and components are consistently refactored to remain under 15-20 lines, pushing repetitive UI chunks into centralized slices.

## 🛡️ Privacy & Security
- **No Direct API Leakage:** AI API keys are never exposed on the client. All Gemini payloads are routed securely through Firebase Cloud Functions.
- **Anonymous Scanning Operations:** User dietary configurations used for AI prompts are kept isolated to the active session payload; the app avoids writing PHI (Personal Health Information) loosely.

---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/AhmetDemiroglu">Ahmet Demiroglu</a></sub>
</div>
