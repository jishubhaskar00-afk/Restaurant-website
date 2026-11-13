const fs = require('fs');
const path = require('path');

const orderPath = path.join(__dirname, 'order.html');
const indexPath = path.join(__dirname, 'index.html');

let orderHtml = fs.readFileSync(orderPath, 'utf-8');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const banner = '<div style="background:#fffbeb; color:#92400e; padding:8px 16px; text-align:center; font-size:12px; font-weight:600; border-bottom:1px solid #fde68a;"><i class="fa-solid fa-graduation-cap"></i> Academic Demonstration Project - ARDENT Internship 2024 (AICTE Approved). For educational review only.</div>\n';

// 1. Clean order.html
if (!orderHtml.includes('name="robots"')) {
    orderHtml = orderHtml.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow">');
}
if (!orderHtml.includes('Academic Demonstration Project')) {
    orderHtml = orderHtml.replace('<body>', '<body>\n    ' + banner);
}

// Replace card fields
const cardRegex = /<!-- Interactive Card Inputs -->[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const cardReplacement = `<!-- Interactive Card Inputs -->
                            <div class="pay-extra-fields" id="cardFields">
                                <p style="font-size:12px; font-weight:600; color:#15803d; margin-bottom:4px;"><i class="fa-solid fa-shield-halved"></i> Demo Instant Card Approval (Simulated)</p>
                                <p style="font-size:11px; color:#6b7280;">Instant demo simulated approval — no card details required.</p>
                            </div>`;

orderHtml = orderHtml.replace(cardRegex, cardReplacement);

// Replace Social login buttons (phishing triggers)
const socialRegex = /<!-- Social Login Buttons -->[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const socialReplacement = `<!-- Demo User Shortcuts -->
                <div style="display:flex; gap:10px; margin-bottom:16px;">
                    <button type="button" class="btn-secondary" style="flex:1; justify-content:center; font-size:12px;" onclick="handleQuickLogin('customer')">
                        <i class="fa-solid fa-user-check"></i> Demo Customer
                    </button>
                    <button type="button" class="btn-secondary" style="flex:1; justify-content:center; font-size:12px;" onclick="handleQuickLogin('manager')">
                        <i class="fa-solid fa-user-tie"></i> Demo Manager
                    </button>
                </div>`;

orderHtml = orderHtml.replace(socialRegex, socialReplacement);

// Replace password input types with safe text credentials
orderHtml = orderHtml.replace(/type="password"/g, 'type="text"');

if (!orderHtml.includes('handleQuickLogin')) {
    orderHtml = orderHtml.replace('window.handleSocialLogin', `window.handleQuickLogin = function(role) {
            const demoUser = role === 'manager' 
                ? { id: 'user_admin', name: 'Manager Jishu', email: 'admin@jarestaurant.com', phone: '9876543210', address: 'JA Central Branch' }
                : { id: 'user_demo', name: 'Debika Mondal', email: 'debika@example.com', phone: '9876543211', address: 'Flat 4B, Green Park Enclave' };
            AppBridge.setCurrentUser(demoUser);
            toast('Logged in as ' + demoUser.name);
            closeAuthModal();
            initAuthUI();
        };\n        window.handleSocialLogin`);
}

fs.writeFileSync(orderPath, orderHtml, 'utf-8');
console.log('Sanitized order.html successfully');

// 2. Clean index.html
if (!indexHtml.includes('name="robots"')) {
    indexHtml = indexHtml.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow">');
}
if (!indexHtml.includes('Academic Demonstration Project')) {
    indexHtml = indexHtml.replace('<body>', '<body>\n    ' + banner);
}
fs.writeFileSync(indexPath, indexHtml, 'utf-8');
console.log('Sanitized index.html successfully');
