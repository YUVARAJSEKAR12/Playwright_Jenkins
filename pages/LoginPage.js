const { BasePage } = require("../base/BasePage");

class LoginPage extends BasePage {
    constructor(page, options) {
        super(page, options);

        // selectors
        this.user = "#username";
        this.pass = "#password";
        this.loginBtn = "#login";
    }

    async login(username, password) {
        await this.type(this.user, username);
        await this.type(this.pass, password);
        await this.click(this.loginBtn);
    }

    async login_one(username, password) {
        await this.type(this.user, username);
        await this.type(this.pass, password);
        await this.click(this.loginBtn);
    }
}

module.exports = { LoginPage };
