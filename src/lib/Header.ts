export default class Header {
  static title = "";

  static async setHeader(title: any) {
    const headerTitleElement = document.getElementById('header-title');
        if (headerTitleElement) {
          headerTitleElement.innerHTML = title;
        }
    // this.title = title;
  }

}