/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

// CRC16-CCITT implementation for EMVCo standard
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function generatePromptPayPayload(targetId: string, amount?: number): string {
  // Strip dashes, spaces
  const cleanId = targetId.replace(/[^0-9]/g, '');

  let targetType: 'mobile' | 'citizen' = 'mobile';
  let formattedTarget = '';

  if (cleanId.length === 10 && cleanId.startsWith('0')) {
    // Thai Mobile Phone (e.g. 0812345678 -> 0066812345678)
    targetType = 'mobile';
    formattedTarget = `0066${cleanId.substring(1)}`;
  } else if (cleanId.length === 13) {
    // National Citizen ID
    targetType = 'citizen';
    formattedTarget = cleanId;
  } else {
    // Fallback or generic mobile format
    targetType = 'mobile';
    formattedTarget = cleanId.startsWith('66') ? `00${cleanId}` : `0066${cleanId}`;
  }

  // Tag 29: Merchant Account Information
  // AID: A000000677010111
  const aidTag = formatTag('00', 'A000000677010111');
  const targetTag = formatTag(targetType === 'mobile' ? '01' : '02', formattedTarget);
  const tag29 = formatTag('29', `${aidTag}${targetTag}`);

  // Base EMVCo tags
  let payload = '';
  payload += formatTag('00', '01'); // Version
  payload += formatTag('01', amount && amount > 0 ? '12' : '11'); // 11=Static, 12=Dynamic
  payload += tag29;
  payload += formatTag('53', '764'); // Currency: THB (764)

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatTag('54', formattedAmount);
  }

  payload += formatTag('58', 'TH'); // Country Code: TH
  payload += '6304'; // CRC Tag with 4 digits placeholder

  const crc = crc16(payload);
  return `${payload}${crc}`;
}

export async function generateQrDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code', err);
    return '';
  }
}
