#!/usr/bin/env node

/**
 * Local Development Setup Script
 * This script helps you set up your local development environment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Setting up local development for Dylan Chesney\'s website\n');
  
  const configPath = 'contentful-config.dev.local.js';
  
  // Check if config already exists
  if (fs.existsSync(configPath)) {
    const overwrite = await question('Local config file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('Please enter your Contentful API credentials:');
  
  const spaceId = await question('Space ID: ');
  const deliveryToken = await question('Delivery Token: ');
  const previewToken = await question('Preview Token: ');
  
  const configContent = `// Development configuration for Contentful - LOCAL USE ONLY
// This file contains real API keys and should NOT be committed to Git
export const contentfulConfig = {
    space: '${spaceId}',
    deliveryToken: '${deliveryToken}',
    previewToken: '${previewToken}',
    environment: 'master',
    postsPerPage: 3
};`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log('\n✅ Local configuration created successfully!');
    console.log('📝 File created: contentful-config.dev.local.js');
    console.log('🔒 This file is ignored by Git to protect your API keys');
    console.log('\n🌟 You can now start your local server and your blog posts should load from Contentful!');
  } catch (error) {
    console.error('❌ Error creating config file:', error.message);
  }
  
  rl.close();
}

main().catch(console.error); 