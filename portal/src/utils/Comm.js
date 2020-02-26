import APIURL, { displayErrors, baseOptions } from "./_commAddresses";

export default class Comm {
  constructor(log) {
    this.isBusy = 0;
    this.log = log;
    if (!log) alert("Comm called w/o log!");
  }

  _detectErrors = response => {
    this.log.log("_detectErrors: response:", response);
    if (!response.ok) {
      this.log.error(
        "_detectErrors: Throwing! (fetching text) resp:",
        response
      );
      return new Promise((resolve, reject) => {
        response.text().then(txt => {
          this.log.error("_detectErrors: text:", txt);
          response.serverText = txt;
          response.serverJSON = {};
          try {
            response.serverJSON = JSON.parse(txt);
          } catch (e) {}
          reject(response);
        });
      });
    }
    return response;
  };

  _delay = (data, secs) => {
    // Force a delay show we can see the spinner
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(data);
      }, secs * 1000);
    });
  };

  _fetch(...args) {
    this.isBusy++;
    let options = baseOptions;
    if (args.length > 1) options = { ...options, ...args[1] };
    if (!options.method) options.method = "GET";
    this.current = options.method + " " + args[0];

    this.log.log("_fetch:", this.isBusy, "URL:", this.current, options);
    return fetch(args[0], options)
      .then(this._detectErrors)
      .then(results => {
        this.log.log("_fetch: ", args[0], " Resulting data:", results);
        return results.text();
        //return results.json().catch(() => results.text());
      })
      .then(resp => {
        let obj;
        // Sorta hacky; the str wont parse if items have embedded
        // control chars like CR or TAB.
        let orig = resp;
        resp = resp.replace(/[\n\r\t]/g, " ");
        try {
          if (resp === "") resp = null;
          obj = JSON.parse(resp);
        } catch (e) {
          return orig; //  because of jsx return string
          /*
          debugger;
          if (displayErrors)
            this.log.error(
              "_fetch: Failed to translate JSON:",
              e,
              " Of object:",
              resp
            );
          throw e;
          */
        }
        return obj;
      })
      .then(data => this._delay(data, 0))
      .catch(err => {
        this.log.error("_fetch: CATCH triggered, err:", err);
        if (err.status === 401 && Comm.handle401) {
          Comm.handle401(err);
          return Promise.resolve({}); // We should cancel the promise chain...
        }
        if (displayErrors)
          alert(
            "send: Communication error sending " +
              this.current +
              "; Error:" +
              err
          );
        // See if the err can be converted to JSON
        let obj = err;
        try {
          if (err === "") err = null;
          obj = JSON.parse(err);
        } catch (e) {}

        throw obj;
      })
      .finally(() => {
        this.isBusy--;
        this.log.log("_fetch: exiting, isBusy:", this.isBusy);
      });
  }

  // This is really an HTTP "GET"; dont ask, long history
  send(target) {
    this.log.log("send: ", target);
    return this._fetch(APIURL + target);
  }
  sendGet = this.send;

  sendPost(target, data, putOrPost) {
    if (!putOrPost) putOrPost = "post";
    this.log.log(
      "sendPost: ",
      target,
      " data:",
      data,
      " putOrPost:",
      putOrPost
    );
    return this._fetch(APIURL + target, {
      method: putOrPost,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }

  sendPut(target, data) {
    return this.sendPost(target, data, "put");
  }

  sendDelete(target, data) {
    this.log.log("sendDelete: ", target, " data:", data);
    return this._fetch(APIURL + target, {
      method: "delete",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }
}
