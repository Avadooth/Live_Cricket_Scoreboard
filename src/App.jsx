import { useState, useEffect } from "react";
import SampleData from "../1426281.json"; // Ensure JSON import works

export default function App() {
  const [data, setData] = useState(null);
  const [inning, setInning] = useState(1);
  const [firstInningScore, setFirstInningScore] = useState(null);
  const [ballIndex, setBallIndex] = useState(0);
  const [displayedBalls, setDisplayedBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [extras, setExtras] = useState(0);
  const [recentBalls, setRecentBalls] = useState([]); // ✅ New state for last 6 balls
  const [overBall, setOverBall] = useState(0);
  const [team, setTeam] = useState([]); // ✅ New state for team

  const [wickets, setWickets] = useState([]); // ✅ New state for wickets

  useEffect(() => {
    setData(SampleData); // Load JSON data
  }, []);

  // console.log("Data_inistaisl----->>>>>>>", data);
  
  useEffect(() => {
    if (data?.info?.teams) {
      setTeam(data.info.teams);
    }
  }, [data]);
  useEffect(() => {
    if (!data || !data.innings) return;

    const allBalls = flattenDeliveries(data);
    // console.log("allBalls---->>>>>>", allBalls);

    const interval = setInterval(() => {
      processNextBall(allBalls);
    }, 2000);

    return () => clearInterval(interval);
  }, [ballIndex, data]);

  const updateOverBall = (currentBall) => {
    // console.log(`Updating over ball with current ball: ${currentBall.over}`);

    const isExtra =
      currentBall.extras && Object.keys(currentBall.extras).length > 0;

    setOverBall((prev) => {
      // If this is the first ball of the over and it's an extra, keep prev value
      if (prev === 0 && isExtra) {
        // console.log("First ball is extra - Keeping ball count at 0.");
        alert("First ball is extra - Keeping ball count at 0.");
        return prev;
      }

      // If it's an extra, don't increase the count
      if (isExtra || !prev === 6) {
        // console.log("Extra run detected - Ball count unchanged.");
        return prev;
      }

      // If it's the first valid ball, start at 1. Otherwise, increment.
      return prev === 6 ? 1 : prev + 1;
    });

    // console.log("Updated ball number:", overBall);
  };

  /** ✅ Function to Flatten Deliveries from Innings */
  const flattenDeliveries = (data) => {
    // console.log("data----->>>>>>>", data);

    // setTeam(data.info.teams);
    if (inning === 2) {
    return data.innings[1].overs.flatMap((over) =>
      over.deliveries.map((delivery) => ({
        ...delivery,
        over: over.over, // Add over number for reference
      }))
    );
    } else {
      return data.innings[0].overs.flatMap((over) =>
        over.deliveries.map((delivery) => ({
          ...delivery,
          over: over.over, // Add over number for reference
        }))
      );
    }
  };

  // console.log("Team---->>>>>>", team);

  const updateRecentBalls = (run, ball) => {
    console.log("Updating recent balls with run:", run);
    console.log("ball-------->>>>", ball);

    setRecentBalls((prev) => {
      // Find the current over number
      const currentOver = ball.over;
      console.log("Current Over----->>>>>>>", currentOver);
      

      // Check if the last ball in recentBalls is from a different over
      if (prev.length > 0 && prev[0].over !== currentOver) {
        return [{ run, over: currentOver }]; // Reset for new over
      }

      return [...prev, { run, over: currentOver }]; // Append runs with over reference
    });

    // console.log("Updated recent balls:", recentBalls);
  };

  /** ✅ Function to Process Next Ball */
  const processNextBall = (allBalls) => {
    if (ballIndex >= allBalls.length) return;

    const currentBall = allBalls[ballIndex];
    const batterRuns = currentBall.runs?.batter || 0;
    // console.log("Current Ball---->>>>>>", currentBall);
    // console.log("Batter Runs---->>>>>>", batterRuns);

    const extraRuns = calculateExtras(currentBall);
    updateRecentBalls(batterRuns, allBalls[ballIndex]);
    updateOverBall(currentBall);

    updateGameState(currentBall, batterRuns, extraRuns);
    const currentOver = currentBall.over;

    if (inning === 1 && currentOver === 19 && overBall === 6) {
      alert("Innings Over! Switching to next inning.");
      setInning(2);
      handleInningChange();
    }
  };
  const handleInningChange = () => {
    alert("Innings Over! Switching to next inning.");

    // if (inning === 2) {
      setFirstInningScore(score); // ✅ Store first inning score
      setScore(0);
      setWickets([]);
      setBallIndex(0); // ✅ Reset to start second inning
      setOverBall(0);
      setDisplayedBalls([]);
      setRecentBalls([]);
    // } else {
    //   // declareResult();
    // }
  };

  // const declareResult = () => {
  //   if (score > firstInningScore) {
  //     alert(`🏆 Team ${team[1]} wins!`);
  //   } else if (score < firstInningScore) {
  //     alert(`🏆 Team ${team[0]} wins!`);
  //   } else {
  //     alert("Match Drawn!");
  //   }
  // };

  /** ✅ Function to Calculate Extra Runs */
  const calculateExtras = (ball) => {
    console.log("Calculating extras for ball:", ball);
    
    return ball.extras
      ? Object.values(ball.extras).reduce((sum, val) => sum + val, 0)
      : 0;
      
  };

  /** ✅ Function to Update Game State */
  const updateGameState = (currentBall, batterRuns, extraRuns) => {
    setExtras((prev) => prev + extraRuns);
    setScore((prev) => prev + batterRuns + extraRuns);
    setDisplayedBalls((prev) => [...prev, currentBall]);
    // updateRecentBalls(currentBall);

    // if (!currentBall.extras) {
    //   setActualBallCount((prev) => prev + 1);
    // }

    if (currentBall.wickets) {
      processWicket(currentBall.wickets);
    }

    setBallIndex((prev) => prev + 1);
  };

  const processWicket = (wicketsData) => {
    const newWickets = wicketsData.map((wicket) => {
      const fielderNames = wicket.fielders
        ? wicket.fielders.map((f) => f.name).join(", ")
        : "N/A";
      return `${wicket.player_out} was ${wicket.kind} ${
        wicket.kind === "caught" ? `by ${fielderNames}` : ""
      }`;
    });

    setWickets((prev) => [...prev, ...newWickets]);
  };

  if (!data || !data.innings) {
    return <div>Loading...</div>;
  }
  // console.log("Data---->>>>>>");
  return (
    <>
      <div className="flex flex-col items-start justify-center min-h-screen bg-gray-100 p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">
             🏏 Live Cricket Scoreboard
        </h2>
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
          {/* Team Names */}
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-2xl font-bold text-indigo-700">
              {team[0]} (Batting)
            </h3>
            <h3 className="text-2xl font-bold text-gray-700">vs</h3>
            <h3 className="text-2xl font-bold text-red-700">
              {team[1]} (Bowling)
            </h3>
          </div>

          {/* Score Details */}
          <div className="flex justify-between items-center border-b pb-4 mt-4">
            <p className="text-xl font-semibold">
              Runs: <span className="text-green-600">{score}</span>
            </p>
            <p className="text-xl font-semibold">
              Wickets: <span className="text-red-600">{wickets.length}</span>
            </p>
            <p className="text-xl font-semibold">
              Overs:{" "}
              <span className="text-gray-700">
                {" "}
                {displayedBalls.length > 0
                  ? `${
                      displayedBalls[displayedBalls.length - 1].over
                    }.${overBall}`
                  : "0.0"}
              </span>
            </p>
          </div>

          {/* Batting & Bowling Info */}
          <div className="mt-4 flex flex-col gap-2">
            <h3 className="text-lg font-medium text-gray-700">Batting:</h3>
            <p className="text-md text-gray-800">
              <span className="font-semibold text-blue-600">Striker:</span>{" "}
              {displayedBalls.length > 0
                ? displayedBalls[displayedBalls.length - 1].batter
                : "N/A"}
            </p>
            <p className="text-md text-gray-800">
              <span className="font-semibold text-green-600">Non-Striker:</span>{" "}
              {displayedBalls.length > 0
                ? displayedBalls[displayedBalls.length - 1].non_striker
                : "N/A"}
            </p>
            <h3 className="text-lg font-medium text-gray-700 mt-2">Bowler:</h3>
            <p className="text-md text-gray-800">
              <span className="font-semibold text-red-600">Bowling:</span>{" "}
              {displayedBalls.length > 0
                ? displayedBalls[displayedBalls.length - 1].bowler
                : "N/A"}
            </p>
          </div>

          {/* Recent Deliveries (Ball-by-Ball) */}
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700">Last 6 Balls</h3>
            <ul className="mt-2 flex gap-2">
              {recentBalls.map((ball, idx) => (
                <li
                  key={idx}
                  className={`px-3 py-1 rounded-md text-white ${
                    ball?.wickets ? "bg-red-500" : "bg-blue-500"
                  }`}
                >
                  {ball.run}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
