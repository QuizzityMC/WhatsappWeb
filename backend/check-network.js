#!/usr/bin/env node

/**
 * Network Connectivity Checker for WhatsApp Web Backend
 * 
 * This script checks if your environment can reach WhatsApp servers
 * Run this before starting the backend to diagnose connection issues
 */

const dns = require('dns');
const https = require('https');

console.log('🔍 Checking network connectivity for WhatsApp Web...\n');

// Test 1: DNS Resolution
console.log('1️⃣ Testing DNS resolution for web.whatsapp.com...');
dns.lookup('web.whatsapp.com', (err, address) => {
  if (err) {
    console.error('❌ FAILED: Cannot resolve web.whatsapp.com');
    console.error(`   Error: ${err.message}`);
    console.error('   → Check your DNS settings or internet connection\n');
  } else {
    console.log(`✅ SUCCESS: web.whatsapp.com resolves to ${address}\n`);
  }

  // Test 2: HTTPS Connection
  console.log('2️⃣ Testing HTTPS connection to web.whatsapp.com...');
  const req = https.get('https://web.whatsapp.com/', (res) => {
    console.log(`✅ SUCCESS: Connected to WhatsApp (Status: ${res.statusCode})\n`);
    
    console.log('✨ All checks passed! Your environment can reach WhatsApp servers.');
    console.log('   You can now start the backend with: npm start\n');
  });

  req.on('error', (err) => {
    console.error('❌ FAILED: Cannot connect to web.whatsapp.com');
    console.error(`   Error: ${err.message}`);
    console.error('\n⚠️  TROUBLESHOOTING:');
    console.error('   • Check if you have an active internet connection');
    console.error('   • Verify your firewall allows HTTPS connections');
    console.error('   • Check if WhatsApp is blocked by your network/ISP');
    console.error('   • Try from a different network (home/mobile hotspot)');
    console.error('   • Some cloud environments (Codespaces) may block WhatsApp\n');
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.error('❌ FAILED: Connection timeout (10s)');
    console.error('   → Your network might be slow or blocking WhatsApp\n');
  });
});
