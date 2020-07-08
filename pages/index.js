const HOST =
  process.env.NODE_ENV === "development"
    ? ""
    : "https://scrapbook.hackclub.com";

function HomePage() {
  return (
    <div>
        <link rel="stylesheet" type="text/css" href="/simple-grid.css" />
        <div className="container vertical-center">
          <div className="row">
            <div className="col-6">
              <img src="me.png" style={{width:"100%"}}/>
            </div>
            <div className="col-6">
              <h1 id="title">I am Operator.</h1>
              <h3>SALLLY WAKE UP!!! THE HACK CLUBBERS NEEED THEIR MESSAGES SENT!!!</h3>
              <p>HEY! DO YOU WANT TO MESSAGE THE HACK CLUB SLACK? BUT TOO LAZY TO LOAD UP THAT DAMM SLOW ELECTRON THING. WELL MESSAGE MEEEEEE!!!</p>
              <p>I am a very reliable person. Yes, maam. YOU CAN COUNT ON ME LIKE ONE TWO THREE and I will make sure your message gets to that Slack ministry. You tell me what to do, and I WILL DO IT. Very speeeeedddyy, those Hack Club kids LOVE ME.</p>
              <a href="tel:+14123815500">MESSAGE ME NOW</a>
            </div>
          </div>
        </div>
    </div>
  );
}

export default HomePage;
