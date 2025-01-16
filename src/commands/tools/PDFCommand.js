const Command = require('../../structures/Command');
const { PDFDocument } = require('pdf-lib');
const imageToPdf = require('image-to-pdf');
const fs = require('fs').promises;
const path = require('path');

class PDFCommand extends Command {
    constructor() {
        super({
            name: 'pdf',
            aliases: ['topdf', 'pdftools'],
            description: 'PDF tools',
            category: 'tools',
            usage: '.pdf <command>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 PDF TOOLS 』 ❒
│
├─❒ 📄 *Commands:*
│ • .pdf merge - Merge PDFs
│ • .pdf split - Split PDF
│ • .pdf img2pdf - Image to PDF
│ • .pdf compress - Compress PDF
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const command = args[0].toLowerCase();

        switch (command) {
            case 'merge':
                await this.mergePDFs(message);
                break;
            case 'split':
                await this.splitPDF(message);
                break;
            case 'img2pdf':
                await this.imageToPDF(message);
                break;
            case 'compress':
                await this.compressPDF(message);
                break;
            default:
                message.reply('❌ Invalid command!');
        }
    }

    async mergePDFs(message) {
        // Implementation for merging PDFs
    }

    async splitPDF(message) {
        // Implementation for splitting PDF
    }

    async imageToPDF(message) {
        if (!message.quoted || !message.quoted.message?.imageMessage) {
            return message.reply('Please reply to an image!');
        }

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            const outputPath = path.join(__dirname, `../../../temp/${Date.now()}.pdf`);

            await imageToPdf([buffer], outputPath);

            await message.client.sendMessage(message.key.remoteJid, {
                document: { url: outputPath },
                mimetype: 'application/pdf',
                fileName: 'converted.pdf'
            });

            await fs.unlink(outputPath);

        } catch (error) {
            console.error('Image to PDF error:', error);
            message.reply('❌ Failed to convert image to PDF.');
        }
    }

    async compressPDF(message) {
        // Implementation for compressing PDF
    }
}

module.exports = PDFCommand; 