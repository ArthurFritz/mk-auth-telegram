const puppeteer = require('puppeteer');
const LOGIN_MK = process.env.LOGIN_MK
const PASS_MK = process.env.PASS_MK
const BASE_URL_MK = process.env.BASE_URL_MK


module.exports = { 
    async closeChamado(chamado, reason) {

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL_MK}login.php`);
    await page.type("#xxlogin", LOGIN_MK);
    await page.type("#xxsenha", PASS_MK);
    await page.click("#btn_entrar");


        await page.goto(`${BASE_URL_MK}suporte_fechar.php?&chamado=${chamado}`);
        await page.type("#motivo_fechar", reason);
        let message='';
        page.on('dialog', async dialog => {
            message = `Resultado do fechamento do chamado:\nChamado: ${chamado}\n${dialog.message()}`;
            console.log(message);
            await dialog.dismiss();
        });

        await page.click("#enviar");
        await browser.close();
        return message;
    }
};