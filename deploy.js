#!/usr/bin/env node
/**
 * Script de deploy automat pentru Prosista
 * Rulează build și uploadă pe FTP
 */

import { execSync } from 'child_process';
import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurație FTP
const FTP_CONFIG = {
  host: 'prosista.ro',
  port: 21,
  user: 'prosista',
  password: 'D3proba+#',
  secure: false
};

const REMOTE_PATH = '/public_html';
const LOCAL_DIST = path.join(__dirname, 'dist');

async function deploy() {
  console.log('🚀 Încep deploy-ul...\n');

  // 1. Build
  console.log('📦 Rulez build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Build complet!\n');
  } catch (error) {
    console.error('❌ Eroare la build:', error.message);
    process.exit(1);
  }

  // 2. Verifică că dist/ există
  if (!fs.existsSync(LOCAL_DIST)) {
    console.error('❌ Folderul dist/ nu există!');
    process.exit(1);
  }

  // 3. Conectare FTP și upload
  console.log('🔌 Conectare la FTP...');
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access(FTP_CONFIG);
    console.log('✅ Conectat la FTP!\n');

    // Navighează la remotePath
    console.log(`📂 Navighez la ${REMOTE_PATH}...`);
    await client.cd(REMOTE_PATH);
    console.log('✅ Am ajuns în folderul corect!\n');

    // Upload recursiv
    console.log('📤 Încep upload-ul fișierelor...\n');
    await uploadDirectory(client, LOCAL_DIST, REMOTE_PATH);

    console.log('\n✅ Deploy complet! Site-ul este live la https://prosista.ro');
  } catch (error) {
    console.error('❌ Eroare la upload:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

async function uploadDirectory(client, localDir, remoteBase) {
  const items = fs.readdirSync(localDir, { withFileTypes: true });

  for (const item of items) {
    const localPath = path.join(localDir, item.name);
    const remotePath = path.posix.join(remoteBase, item.name);

    if (item.isDirectory()) {
      console.log(`📁 Creez folder: ${item.name}`);
      try {
        await client.ensureDir(remotePath);
      } catch (error) {
        // Folderul poate exista deja
      }
      await uploadDirectory(client, localPath, remotePath);
    } else {
      const stats = fs.statSync(localPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`📄 Upload: ${item.name} (${sizeKB} KB)`);
      await client.uploadFrom(localPath, remotePath);
    }
  }
}

// Rulează deploy-ul
deploy().catch(console.error);

