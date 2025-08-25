#!/usr/bin/env node

/**
 * 빌드 스크립트 - DigitalOcean 배포용
 */

const fs = require('fs').promises;
const path = require('path');

async function build() {
  console.log('🔧 Building Zupp SEO Analyzer...');
  
  // dist 폴더 생성
  const distPath = path.join(__dirname, '..', 'dist');
  try {
    await fs.mkdir(distPath, { recursive: true });
    console.log('✅ Created dist directory');
  } catch (error) {
    console.error('❌ Error creating dist directory:', error);
  }
  
  // 필요한 파일들 복사
  const filesToCopy = [
    'index.html',
    'ui.js',
    'ui.css',
    'zupp.js',
    'zupp-bookmarklet.js',
    'analyzers.js',
    'analyzers-geo.js',
    'analyzers-technical.js',
    'analyzers-extended.js',
    'contact-system.js'
  ];
  
  for (const file of filesToCopy) {
    try {
      const srcPath = path.join(__dirname, '..', file);
      const destPath = path.join(distPath, file);
      await fs.copyFile(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    } catch (error) {
      console.warn(`⚠️  Could not copy ${file}:`, error.message);
    }
  }
  
  // 폴더 복사
  const foldersToCopy = ['demo', 'docs'];
  for (const folder of foldersToCopy) {
    try {
      const srcPath = path.join(__dirname, '..', folder);
      const destPath = path.join(distPath, folder);
      await copyDirectory(srcPath, destPath);
      console.log(`✅ Copied ${folder} directory`);
    } catch (error) {
      console.warn(`⚠️  Could not copy ${folder}:`, error.message);
    }
  }
  
  // 북마클릿 URL 업데이트
  await updateBookmarkletUrl(distPath);
  
  console.log('🎉 Build complete!');
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function updateBookmarkletUrl(distPath) {
  const indexPath = path.join(distPath, 'index.html');
  try {
    let content = await fs.readFile(indexPath, 'utf8');
    
    // localhost URL을 프로덕션 URL로 변경
    content = content.replace(
      /http:\/\/localhost:8000/g,
      'https://zupp-seo-analyzer.ondigitalocean.app'
    );
    
    await fs.writeFile(indexPath, content);
    console.log('✅ Updated bookmarklet URLs');
  } catch (error) {
    console.warn('⚠️  Could not update URLs:', error.message);
  }
}

// 실행
build().catch(console.error);