/**
 * Quick test: verify Google Ads API connection and check for LSA leads.
 * Usage: node scripts/test-lsa-api.js
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleAdsApi } = require('google-ads-api');

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;

console.log('=== Google Ads LSA API Test ===\n');
console.log('Customer ID:', CUSTOMER_ID);
console.log('Developer Token:', DEVELOPER_TOKEN?.slice(0, 8) + '...');
console.log('');

async function test() {
    const client = new GoogleAdsApi({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        developer_token: DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
        customer_id: CUSTOMER_ID,
        refresh_token: REFRESH_TOKEN,
    });

    // Test 1: Basic connection — query account info
    console.log('--- Test 1: Account info ---');
    try {
        const accountRows = await customer.query(`
            SELECT customer.id, customer.descriptive_name
            FROM customer
            LIMIT 1
        `);
        if (accountRows.length > 0) {
            const acct = accountRows[0].customer;
            console.log(`Connected! Account: ${acct.descriptive_name} (ID: ${acct.id})`);
        }
    } catch (err) {
        console.error('Account query failed:', err.message);
        if (err.errors) {
            for (const e of err.errors) {
                console.error('  -', JSON.stringify(e));
            }
        }
        return;
    }

    // Test 2: Check for Local Services campaigns
    console.log('\n--- Test 2: Local Services campaigns ---');
    try {
        const campaignRows = await customer.query(`
            SELECT
                campaign.id,
                campaign.name,
                campaign.advertising_channel_type
            FROM campaign
            WHERE campaign.advertising_channel_type = 'LOCAL_SERVICES'
            LIMIT 5
        `);
        if (campaignRows.length > 0) {
            console.log(`Found ${campaignRows.length} Local Services campaign(s):`);
            for (const row of campaignRows) {
                console.log(`  - ${row.campaign.name} (ID: ${row.campaign.id})`);
            }
        } else {
            console.log('No Local Services campaigns found in this account.');
            console.log('This account may not be the one running LSA.');
        }
    } catch (err) {
        console.error('Campaign query failed:', err.message);
    }

    // Test 3: Try to query LSA leads (last 30 days)
    console.log('\n--- Test 3: Recent LSA leads ---');
    try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sinceStr = since.toISOString().replace('T', ' ').slice(0, 23) + '+00:00';

        const leadRows = await customer.query(`
            SELECT
                local_services_lead.resource_name,
                local_services_lead.lead_type,
                local_services_lead.category_id,
                local_services_lead.contact_details,
                local_services_lead.lead_status,
                local_services_lead.creation_date_time,
                local_services_lead.lead_charged
            FROM local_services_lead
            WHERE local_services_lead.creation_date_time >= '${sinceStr}'
            ORDER BY local_services_lead.creation_date_time DESC
            LIMIT 5
        `);

        if (leadRows.length > 0) {
            console.log(`Found ${leadRows.length} LSA lead(s) in last 30 days:`);
            for (const row of leadRows) {
                const lead = row.local_services_lead;
                console.log(`  - ${lead.creation_date_time} | Type: ${lead.lead_type} | Status: ${lead.lead_status} | Phone: ${lead.contact_details?.phone_number || 'N/A'}`);
            }
        } else {
            console.log('No LSA leads found in last 30 days.');
        }
    } catch (err) {
        console.error('LSA lead query failed:', err.message);
        if (err.message?.includes('not found') || err.message?.includes('PERMISSION_DENIED')) {
            console.log('\nThis likely means the LSA account is NOT linked to this Google Ads account.');
            console.log('You may need to use a different customer ID or link the accounts.');
        }
    }

    console.log('\n=== Test complete ===');
}

test().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
