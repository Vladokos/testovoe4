import { useCallback, useEffect, useMemo, useRef, useState } from "react"

//styles
import './App.css';
import OutsideClick from "./hooks/OutsideClick";


function App() {
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [yPosFirst, setYPosFirst] = useState(250);
  const [yPosSecond, setYPosSecond] = useState(250);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [leverFirst, setLeverFirst] = useState(1);
  const [leverSecond, setLeverSecond] = useState(1);

  const [firstFireRate, setFirstFireRate] = useState(6)
  const [secondFireRate, setSecondFireRate] = useState(6)
  const [firstSpeed, setFirstSpeed] = useState(1);
  const [secondSpeed, setSecondSpeed] = useState(1);

  const [firstCD, setFirstCD] = useState(Date.now())
  const [secondCD, setSecondCD] = useState(Date.now())

  const [firstColor, setFirstColor] = useState("red");
  const [secondColor, setSecondColor] = useState("red");
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [visiblePopup, setVisiblePopup] = useState(false);
  const [wizard, setWizard] = useState(1);

  const [circles, setCircles] = useState([])

  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const modalRef = useRef(null);

  const createRound = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    //first round
    context.beginPath();
    context.arc(100, yPosFirst, 40, 0, 2 * Math.PI, false);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
    context.closePath();

    //second round
    context.beginPath();
    context.arc(1400, yPosSecond, 40, 0, 2 * Math.PI, false);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
    context.closePath();

    circles.map((circle, index) => {
      if (circles.length > 0) {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
        context.fillStyle = circle.wizard === 1 ? firstColor : secondColor;
        context.fill();
        context.closePath();
      }
    });

    //проверка границы поля 
    //при достижении границы изменяется направление
    yPosFirst >= 460 ? setLeverFirst(leverFirst => leverFirst = firstSpeed * -1) : yPosFirst <= 40 && setLeverFirst(leverFirst => leverFirst = firstSpeed * 1);
    yPosSecond <= 40 ? setLeverSecond(leverSecond => leverSecond = secondSpeed * -1) : yPosSecond >= 460 && setLeverSecond(leverSecond => leverSecond = secondSpeed * 1);

    setYPosFirst(yPosFirst => yPosFirst + leverFirst);
    setYPosSecond(yPosSecond => yPosSecond - leverSecond);
    setCircles(circles =>
      circles.map((circle, index) =>
        circle.wizard === 1
          ? { ...circle, x: circle.x + 1 }
          : { ...circle, x: circle.x - 1 }
      )
    );
    //проверка попадания
    circles.map((circle) => {
      if (circle.x >= 53 && circle.x <= 138 && (circle.y <= yPosFirst + 60 && circle.y >= yPosFirst - 30)) {
        setRightScore(rightScore => rightScore + 1);
        circle.x = -100;

      }
      if (circle.x >= 1353 && circle.x <= 1438 && (circle.y <= yPosSecond + 60 && circle.y >= yPosSecond - 40)) {
        setLeftScore(leftScore => leftScore + 1)
        circle.x = 1600;
      }
    })


    canvas.onmousemove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      setCursorPos({ x: Math.round(x), y: Math.round(y) })
    }

    requestRef.current = requestAnimationFrame(createRound);

    if (leverFirst === -1) {

      if (yPosFirst === cursorPos.y + 60 && (cursorPos.x >= 53 && cursorPos.x <= 138)) {
        setLeverFirst(1)

        setYPosFirst(yPosFirst => yPosFirst + leverFirst);
      }
    } else {

      if (yPosFirst === cursorPos.y - 30 && (cursorPos.x >= 53 && cursorPos.x <= 138)) {
        setLeverFirst(-1)

        setYPosFirst(yPosFirst => yPosFirst + leverFirst);
      }
    }


    if (leverSecond === -1) {
      if (yPosSecond === cursorPos.y - 30 && (cursorPos.x >= 1353 && cursorPos.x <= 1438)) {
        setLeverSecond(1)

        setYPosSecond(yPosSecond => yPosSecond + leverSecond);
      }
    } else {
      if (yPosSecond === cursorPos.y + 60 && (cursorPos.x >= 1353 && cursorPos.x <= 1438)) {
        setLeverSecond(-1)

        setYPosSecond(yPosSecond => yPosSecond - leverSecond);
      }
    }



    canvas.addEventListener('click', function (event) {
      // координаты клика
      const rectCanvas = canvas.getBoundingClientRect();
      const x = event.clientX - rectCanvas.left;
      const y = event.clientY - rectCanvas.top;

      //попадает ли клик 
      if (x >= 100 && x <= 100 + 40 && y >= yPosFirst && y <= yPosFirst + 40) {
        console.log('Клик внутри!1');
        setPopupPos({ x: x, y: y });
        setVisiblePopup(true);
        setWizard(1);

      } else if (x >= 1400 && x <= 1400 + 40 & y >= yPosSecond && y <= yPosSecond + 40) {
        console.log('Клик внутри!2');
        setPopupPos({ x: x, y: y });
        setWizard(2);
        setVisiblePopup(true);
      }
    });

  }

  useEffect(() => {
    const now = Date.now();
    if (now - firstCD >= Number(firstFireRate + "000")) {
      setCircles(smallCircles => [
        ...smallCircles,
        { x: 200, y: yPosFirst, r: 20, wizard: 1 },

      ]);
      setFirstCD(Date.now());
    }
    if (now - secondCD >= Number(secondFireRate + "000")) {
      setCircles(smallCircles => [
        ...smallCircles,
        { x: 1300, y: yPosSecond, r: 20, wizard: 2 },

      ]);
      setSecondCD(Date.now());
    }
  }, [yPosFirst, yPosSecond]);

  useEffect(() => {


    requestRef.current = requestAnimationFrame(createRound);

    return () => {
      cancelAnimationFrame(requestRef.current);
    }

  }, [yPosFirst, yPosSecond]);


  OutsideClick(modalRef, () => setVisiblePopup(false))
  return (
    <div className="App">
      <div>
        {leftScore}:{rightScore}
      </div>
      <canvas
        ref={canvasRef}
        width={1500}
        height={500}
        style={{ border: '1px solid black' }}
      ></canvas>
      <div className="settings">
        <div>
          <div>
            <p>Скорость стрельбы первого мага</p>
            <div className="inputBlock">
              <input type="range" step={2} min={2} max={16} value={firstFireRate} onChange={(e) => setFirstFireRate(e.target.value)} />
              {firstFireRate}
            </div>
            <p>Скорость передвижения первого игрока</p>
            <div className="inputBlock">
              <input type="range" step={1} min={1} max={8} value={firstSpeed} onChange={(e) => { setFirstSpeed(e.target.value); setLeverFirst(leverFirst => leverFirst > 0 ? leverFirst = firstSpeed * 1 : leverFirst = firstSpeed * -1) }} />
              {firstSpeed}
            </div>
          </div>
        </div>
        <div>
          <div>
            <p>Скорость стрельбы второго мага</p>
            <div className="inputBlock">
              <input type="range" step={2} min={2} max={16} value={secondFireRate} onChange={(e) => setSecondFireRate(e.target.value)} />
              {secondFireRate}
            </div>
            <p>Скорость передвижения второго игрока</p>
            <div className="inputBlock">
              <input type="range" step={1} min={1} max={8} value={secondSpeed} onChange={(e) => { setSecondSpeed(e.target.value); setLeverSecond(leverSecond => leverSecond > 0 ? leverSecond = secondSpeed * 1 : leverSecond = secondSpeed * -1) }} />
              {secondSpeed}
            </div>
          </div>
        </div>
      </div>
      {visiblePopup &&
        <div className="popup" ref={modalRef} style={{ transform: `translate(${popupPos.x}px, ${popupPos.y}px)` }}>
          <p>Выберите цвет магии</p>
          <ul>
            <li onClick={() => wizard === 1 ? setFirstColor("green") : setSecondColor("green")}>Green</li>
            <li onClick={() => wizard === 1 ? setFirstColor("red") : setSecondColor("red")}>Red</li>
            <li onClick={() => wizard === 1 ? setFirstColor("black") : setSecondColor("black")}>Black</li>
          </ul>
          <p>Нажмите за пределы окна <br /> чтобы его закрыть</p>
        </div>
      }
    </div>
  );
}

export default App;
