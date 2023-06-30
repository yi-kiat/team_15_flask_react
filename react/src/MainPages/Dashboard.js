// React imports
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';

// Standard imports
import Navbar from "../SharedComponents/Navbar";
import { FormatDateTime, GetDateDiffString } from '../Utils/Time';
import { CardContent, CardButton, DashboardCard, ChargingCard } from '../SharedComponents/Card';

// API endpoints imports
import { ChargeCurrentGet, ChargeHistoryGet, VehicleInfoGetById } from '../API/API';

export default function Dashboard() {
  const userEmail = localStorage.getItem("user_email");

  const [chargeCurrentDetails, setChargeCurrentDetails] = useState(null);
  const [chargeHistoryDetails, setChargeHistoryDetails] = useState(null);
  const [chargeCurrentVehicleDetails, setChargeCurrentVehicleDetails] = useState(null);
  const [timeElapsedString, setTimeElapsedString] = useState('');

  // Function that gets user's current charge. Called on page load, populates chargeCurrentDetails.
  async function fetchUserChargeCurrentAndHistoryAndVehicle() {
    const ResponseCurrent = await ChargeCurrentGet(userEmail);

    // result is boolean of status
    if (ResponseCurrent.status === 'success' && ResponseCurrent.data !== null) {
      setChargeCurrentDetails(ResponseCurrent.data);
    } else {
      return;
    }

    const ResponseHistory = await ChargeHistoryGet(userEmail, 'in_progress');

    // result is boolean of status
    if (ResponseHistory.status === 'success') {
      setChargeHistoryDetails(ResponseHistory.data);
      setTimeElapsedString(GetDateDiffString(ResponseHistory.data.time_start, DateTime.now().toISO()));
    }

    const ResponseVehicle = await VehicleInfoGetById(ResponseHistory.data.id_vehicle_info);

    // result is boolean of status
    if (ResponseVehicle.status === 'success') {
      setChargeCurrentVehicleDetails(ResponseVehicle.data);
    }
  }

  useEffect(() => {
    fetchUserChargeCurrentAndHistoryAndVehicle();
  }, []);

  // Refresh timer every second (1 * 1000) ms
  useEffect(() => {
    setInterval(function () {
      chargeHistoryDetails && setTimeElapsedString(GetDateDiffString(chargeHistoryDetails.time_start, DateTime.now().toISO()));
    }, 1 * 1000);
  }, [chargeHistoryDetails]);

  return (
    <div className="h-screen bg-gray-300">
      <Navbar transparent />

      <main>
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center"
          style={{
            height: "75vh"
          }}>

          <div className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage: "url('landing-image.jpg')"
            }}>
            <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
          </div>
          <div className="container relative mx-auto">
            <div className="items-center flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div className="pr-12">
                  <h1 className="text-white font-semibold text-5xl">
                    The best EV charging experience.
                  </h1>
                  <p className="mt-4 text-lg text-gray-300">
                    All your expenses in one place. Mark your favourite chargers, and get recommended charging locations while you're on the go.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <section className="bg-gray-300 -mt-24">

          {/* Charging status */}
          {chargeCurrentDetails && chargeHistoryDetails && chargeCurrentVehicleDetails &&
            <ChargingCard elementName="Current Charging Status"
              vName={chargeCurrentVehicleDetails.name}
              SN={chargeCurrentVehicleDetails.vehicle_sn}
              currPercent={chargeCurrentDetails.percentage_current + '%'}
              startTime={FormatDateTime(chargeHistoryDetails.time_start)}
              timeElapsed={timeElapsedString} />}

          {/* Three boxes - charging history, favourites, map */}
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap">

              <DashboardCard lower color="blue" link="/ChargingHistory" elementName="Track your expenses" icon="dollar-sign">
                Tracking your charging time, location, and expenses<br></br>no matter which charger brand you use.
              </DashboardCard>

              <DashboardCard color="red" link="/Favourites" elementName="Favourite chargers" icon="heart">
                Save the location of your favourite EV chargers<br></br>with just a click.
              </DashboardCard>

              <DashboardCard lower color="green" link="/Recommendations" elementName="Get recommendations on the go" icon="map-marker-alt">
                Don't know where to find chargers? Use our map,<br></br>complete with recommendations for you!
              </DashboardCard>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
