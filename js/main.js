// =================================================================
// QUICK LOAN DESK - CORE CUSTOMER WEBSITE LOGIC & FUNNEL
// =================================================================

import { db } from "./firebase-config.js";
import { collection, addDoc, getDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Permanent OneAndro Master Links (DSA Integrated)
const LINK_CIBIL_CHECK = "https://crm.oneandro.com/customer-service?d=c29mdF9jb2RlPVJLTUFITkEzNjA0OTQ0MCZjaGVja19zY29yZT10cnVlJnNjb3JlX3R5cGU9RXF1aWZheCZ0b2tlbl9rZXk9QVBKNTRwTXImbG9naW5faWQ9dW5kZWZpbmVkJnNoYXJlX2xlYWRfdHlwZT0yJnV0bV9zb3VyY2U9c2hhcmVfbGluaw%3D%3D";
const LINK_DIRECT_APPLY = "https://crm.oneandro.com/customer-service?d=c29mdF9jb2RlPVJLTUFITkEzNjA0OTQ0MCZ0b2tlbl9rZXk9dlpjYkllaWQmbG9naW5faWQ9dW5kZWZpbmVkJnNoYXJlX2xlYWRfdHlwZT0xJnV0bV9zb3VyY2U9c2hhcmVfbGluaw%3D%3D";

/**
 * Dynamically fetch promotional banner from Firebase Firestore (Set via Admin Panel)
 */
async function loadDynamicBanner() {
    try {
        const bannerDocRef = doc(db, "site_settings", "banner");
        const docSnap = await getDoc(bannerDocRef);
        
        if (docSnap.exists() && docSnap.data().imageUrl) {
            const imageUrl = docSnap.data().imageUrl;
            const fallbackBox = document.querySelector(".banner-fallback");
            const imgElement = document.getElementById("liveDynamicBanner");
            
            if (fallbackBox && imgElement) {
                fallbackBox.style.display = "none";
                imgElement.src = imageUrl;
                imgElement.style.display = "block";
            }
        }
    } catch (error) {
        console.error("Error loading dynamic banner from database:", error);
    }
}

/**
 * Display sleek inline alert notifications on the form card
 */
function showAlert(message) {
    const alertBox = document.getElementById("formAlertMessage");
    if (!alertBox) return;
    
    alertBox.innerText = message;
    alertBox.style.display = "block";
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 5000);
}

/**
 * Core Lead Submission & Routing Handler with 24-Hour Spam Protection
 */
async function handleLeadSubmission(intentType, targetUrl) {
    const fullName = document.getElementById("fullName").value.trim();
    const whatsappNo = document.getElementById("whatsappNo").value.trim();
    const loanCategory = document.getElementById("loanCategory").value;
    const legalConsent = document.getElementById("legalConsent").checked;

    // 1. Field Validation Checks
    if (!fullName || !whatsappNo || !loanCategory) {
        showAlert("⚠️ Please fill in all required fields to proceed.");
        return;
    }

    // 2. Mobile Number Validation (Exact 10 digits)
    if (!/^[0-9]{10}$/.test(whatsappNo)) {
        showAlert("⚠️ Please enter a valid 10-digit WhatsApp mobile number.");
        return;
    }

    // 3. Mandatory DPDP Consent Check
    if (!legalConsent) {
        showAlert("⚠️ You must accept the terms and privacy policy consent to proceed.");
        return;
    }

    // 4. 24-Hour Spam Protection Logic (Checking LocalStorage)
    const storageKey = "qld_lead_ts_" + whatsappNo;
    const lastSubmissionTime = localStorage.getItem(storageKey);
    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (lastSubmissionTime && (currentTime - lastSubmissionTime < twentyFourHours)) {
        showAlert("❌ You have already applied within the last 24 hours. Please try again after 24 hours or contact support.");
        return;
    }

    // 5. Temporarily disable CTA buttons to prevent double-clicks/spam
    const btnCibil = document.getElementById("btnCheckCibil");
    const btnApply = document.getElementById("btnDirectApply");
    
    btnCibil.disabled = true;
    btnApply.disabled = true;
    btnCibil.style.opacity = "0.7";
    btnApply.style.opacity = "0.7";
    btnCibil.innerText = "Processing securely...";

    try {
        // 6. Save Lead securely to Firebase Firestore 'leads' collection
        await addDoc(collection(db, "leads"), {
            fullName: fullName,
            whatsappNumber: whatsappNo,
            loanType: loanCategory,
            intent: intentType,
            timestamp: serverTimestamp(),
            status: "New Lead"
        });

        // 7. Set 24-hour lockout timestamp in browser storage
        localStorage.setItem(storageKey, currentTime);

        // 8. Seamlessly redirect user to OneAndro Master Link
        window.location.href = targetUrl;

    } catch (error) {
        console.error("Database submission error: ", error);
        showAlert("❌ Network error connecting to secure database. Please check your internet and try again.");
        
        // Re-enable buttons on error
        btnCibil.disabled = false;
        btnApply.disabled = false;
        btnCibil.style.opacity = "1";
        btnApply.style.opacity = "1";
        btnCibil.innerText = "🔍 Check Free CIBIL & Proceed";
    }
}

// Attach Event Listeners on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    // Load Banner from Cloudinary/Firebase
    loadDynamicBanner();

    // Event Listener for CIBIL Check Button
    const btnCibil = document.getElementById("btnCheckCibil");
    if (btnCibil) {
        btnCibil.addEventListener("click", () => {
            handleLeadSubmission("Check CIBIL Score", LINK_CIBIL_CHECK);
        });
    }

    // Event Listener for Direct Loan Application Button
    const btnApply = document.getElementById("btnDirectApply");
    if (btnApply) {
        btnApply.addEventListener("click", () => {
            handleLeadSubmission("Direct Loan Application", LINK_DIRECT_APPLY);
        });
    }
});
