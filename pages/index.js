function HomePage() {
  return (
    <div>
      <center>
        <style jsx>{`
          h1 {
            background: linear-gradient(
              to right,
              orange,
              yellow,
              green,
              cyan,
              blue,
              violet
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 60px;
            line-height: 60px;
          }
        `}</style>
        <h1 id="title">I am Operator</h1>
      </center>
    </div>
  );
}

export default HomePage;
