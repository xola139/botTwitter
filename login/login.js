var utils = require('utils'),
    fs = require('fs'), tweet_account_name,
    nbLinks, outputfilename,
    header = "Tweet,Timestamp",
    css, count = 0, images,
    casper = require('casper').create({
        viewportSize: {
            width: 480,
            height: 360
        },
        pageSettings: {
            loadImages: false,
            loadPlugins: false,
            userAgent: 'BlackBerry9700/5.0.0.351 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/123'
        }
    });

/*if (!casper.cli.has("account_name") || !casper.cli.has("css") || !casper.cli.has("images")) {
    casper.echo("Ex: casperjs.exe scrape_tweets.js --css=1 --images=0 --account_name=nigeriaitskills");
    casper.exit(1);

}*/

//tweet_account_name = casper.cli.get("account_name");
//css = Number(casper.cli.get("css"));
//images = Number(casper.cli.get("images"));

/*casper.options.onResourceRequested = function (casperjs, requestData, networkRequest) {
    if (css) {
        var did_css = requestData.url.indexOf(".css") > -1,
            vague_css = (/http[s]:\/\/.+?.css/gi).test(requestData.url);

        if (vague_css || did_css) networkRequest.abort();
    }

    if (images) {
        var dig = requestData.url.indexOf(".png") > -1 || requestData.url.indexOf(".gif") > -1,
            did_pix = dig || requestData.url.indexOf(".jpg") > -1,
            vague_pix = (/([^s]+(?=.(jpg|gif|png)).2)/gi).test(requestData.url);

        if (vague_pix || did_pix || requestData.url.indexOf(".jpeg") > -1) networkRequest.abort();
    }
};*/

/*casper.on('error', function (msg, backtrace) {
    this.echo(JSON.stringify({msg: msg, backtrace: backtrace}, null, 2));
    this.die('internal errors.');
});*/

function RecursiveTriverse(thecasper, newurl) {
    newurl = 'https://mobile.twitter.com' + newurl;

    thecasper.thenOpen(newurl, function () {
        this.wait(9000);
        count += 1;

        casper.waitWhileSelector('div.js-tweet-text-container', function() {
            var query = this.evaluate(function () {
            var data = [], checks = 'div.tweet-text div.dir-ltr a.twitter_external_link.dir-ltr.tco-link';


            console.log(document.querySelectorAll('div.js-tweet-text-container'));

            [].forEach.call(document.querySelectorAll('div.js-tweet-text-container'), function (item) {
                console.log(item);
                var tweeted = item.querySelector('div.tweet-text').textContent.replace(/"/g, "'");
                var time_stamp = item.querySelector('tr.tweet-header td.timestamp').textContent.trim();
                var replace_links = item.querySelectorAll(checks);
                tweeted = tweeted.replace(/\n/g, " ").trim();

                this.echo(item.querySelectorAll(checks));

                //TODO: fix this 'if' part, it's not working
                if (replace_links.length) {
                    for (var i = 0; i < replace_links.length; i++) {
                        tweeted.replace(replace_links[i].textContent.trim(), replace_links[i].href);
                    }
                } //TODO: end of 'if' part that's not working

                data.push('"' + tweeted + '",' + time_stamp);
            });

            return data;
        });




        })

        
       // stream.writeLine(query.join('\n'));
        //this.echo(count + ': ' + newurl + ' size: ' + quer);

        if (this.exists("div.w-button-more")) {
            nbLinks = this.evaluate(function () {
                return document.querySelector("div.w-button-more a").getAttribute('href');
            });

            RecursiveTriverse(this, nbLinks);
        }
    });
}

casper.start('https://mobile.twitter.com/xola139', function () {
    if (this.exists("td.timestamp a")) {
        outputfilename = tweet_account_name + ".csv";

        //if (fs.exists(outputfilename)) fs.remove(outputfilename);

        //stream = fs.open(outputfilename, "w");
        //stream.writeLine(header);

        this.then(function () {
            RecursiveTriverse(this, '/xola139');
        });
    } else {
        casper.die("Sorry, that page doesn't exist!");
    }
});

casper.then(function () {
   // stream.close();
   // stream.flush();
    this.echo('Done');
});

casper.run();