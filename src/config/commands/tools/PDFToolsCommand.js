const Command = require('../../structures/Command');
const pdf = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

class PDFToolsCommand extends Command {
    constructor() {
        super({
            name: 'pdf',
            aliases: ['pdftools'],
            description: 'Manipulate PDF files',
            category: 'tools',
            usage: '.pdf <merge/split> <reply to pdf>'
        });
    }

    async execute(message, args) {
        if (!args[0] || !message.quoted) {
            return message.reply(`╭─❒ 『 PDF TOOLS 』 ❒
│
├─❒ 📄 *Commands:*
│ • merge - Merge multiple PDFs
│ • split - Split a PDF into individual pages
│
├─❒ 📝 *Usage:*
│ .pdf <merge/split>
│ (Reply to a PDF file)
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`);
        }

        const action = args[0].toLowerCase();
        const inputPath = path.join(__dirname, `../../../temp/input_${Date.now()}.pdf`);
        const outputPath = path.join(__dirname, `../../../temp/output_${Date.now()}.pdf`);

        try {
            const buffer = await downloadMediaMessage(message.quoted, 'buffer');
            await fs.writeFile(inputPath, buffer);

            if (action === 'merge') {
                // Implement merging logic here
            } else if (action === 'split') {
                // Implement splitting logic here
            } else {
                return message.reply('❌ Invalid action!');
            }

            await message.client.sendMessage(message.key.remoteJid, {
                document: { url: outputPath },
                mimetype: 'application/pdf',
                fileName: 'output.pdf',
                caption: '✨ Processed by Dineth MD'
            });

            // Cleanup
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);

        } catch (error) {
            console.error('PDF tools error:', error);
            message.reply('❌ Failed to process PDF.');
        }
    }
}

module.exports = PDFToolsCommand; 