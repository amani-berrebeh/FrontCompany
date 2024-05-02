import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Tab,
  Button,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import Breadcrumb from "Common/BreadCrumb";
import { Link, useNavigate } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

import Swal from "sweetalert2";
import "./AddProgram.css";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useGetAllVehicleTypesQuery } from "../../../features/vehicleType/vehicleTypeSlice";
import { useGetAllLuggageQuery } from "../../../features/luggage/luggageSlice";
import { useGetAllJourneyQuery } from "../../../features/journey/journeySlice";
import { useSelector } from "react-redux";
import { RootState } from "app/store";
import { selectCurrentUser } from "features/account/authSlice";
import { useAddProgramMutation } from "features/program/programSlice";

interface Option {
  value: string;
  label: string;
}
const options = [
  { value: "ForHandicap", label: "For Handicap" },
  { value: "Wifi", label: "Wifi" },
  { value: "WC", label: "WC" },
  { value: "AC", label: "AC" },
];

const options1: Option[] = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];
const center = { lat: 52.4862, lng: -1.8904 };

interface Recap {
  programName: string;
  capacityRecommanded: string;
  selected: string[];
  selected1: string[];
  stops: google.maps.LatLng[];
  originRef: string;
  destinationRef: string;
  dropOff_date: string;
  dropOff_time: string;
  free_date: string[];
  pickUp_date: string;
  pickUp_time: string;
}

interface Stop {
  id: number;
  address: string;
}
interface RouteSegment {
  segment: number;
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
}
interface stopTime {
  hours: number;
  minutes: number;
}

const AddProgramm = (props: any) => {
  document.title = "Program | Company Administration";
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => selectCurrentUser(state));
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [activeVerticalTab, setactiveVerticalTab] = useState<number>(1);
  const [programName, setProgramName] = useState("");
  const [capacityRecommanded, setCapacityRecommanded] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selected1, setSelected1] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchStop, setSearchStop] = useState("");
  const [fatma, setFatma] = useState<any>();
  const [stop, setStop] = useState<any>();
  const [nom, setNom] = useState<any>();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [routeDirections, setRouteDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  const originRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);
  const stopRef = useRef<any>(null);

  const flatpickrRef = useRef<Flatpickr>(null);

  const [destSwitchRef, setDestSwitchRef] = useState<google.maps.LatLng[]>([]);
  const [originSwitchRef, setOriginSwitchRef] = useState<google.maps.LatLng[]>(
    []
  );
  const [pickUp_time, setPickUp_time] = useState<Date>();
  const [dropOff_time, setDropOff_time] = useState<Date | null>(null);

  const [dropOff_date, setDropOff_date] = useState<Date | null>(null);
  const [free_date, setFree_date] = useState<Date[]>([]);

  const [pickUp_date, setPickUp_date] = useState<Date | null>(null);

  const [stops2, setStops2] = useState<Stop[]>([]);
  const [recap, setRecap] = useState<Recap>({
    programName: "",
    capacityRecommanded: "",
    selected: [],
    selected1: [],
    stops: [],
    originRef: "",
    destinationRef: "",
    dropOff_date: "",
    dropOff_time: "",
    free_date: [],
    pickUp_date: "",
    pickUp_time: "",
  });

  const [test2, setTest2] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBbORSZJBXcqDnY6BbMx_JSP0l_9HLQSkw",
    libraries: ["places"],
  });

  const [stops, setStops] = useState<google.maps.LatLng[]>([]);

  const [waypts, setWaypts] = useState<google.maps.DirectionsWaypoint[]>([]);

  const [stopTimes, setStopTimes] = useState<stopTime[]>([]);

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [createProgram] = useAddProgramMutation();
  const { data: AllVehicleTypes = [] } = useGetAllVehicleTypesQuery();
  const { data: AllLuggages = [] } = useGetAllLuggageQuery();
  const { data: AllJourneys = [] } = useGetAllJourneyQuery();

  const [selectedVehicleType, setSelectedVehicletype] = useState<string>("");
  // This function is triggered when the select Vehicle Type
  const handleSelectVehicleType = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setSelectedVehicletype(value);
  };

  const [selectedLuggage, setSelectedLuggage] = useState<string>("");
  // This function is triggered when the select Luggage
  const handleSelectLuggage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedLuggage(value);
  };

  const [selectedJourney, setSelectedJourney] = useState<string>("");
  // This function is triggered when the select Journey
  const handleSelectJourney = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedJourney(value);
  };
  const [programmData, setProgrammData] = useState({
    programName: "",
    note: "",
    origin_point: {
      placeName: "",
      coordinates: {
        lat: 1,
        lng: 1,
      },
    },
    stops: [
      {
        id: "",
        address: "",
        time: "",
      },
    ],
    destination_point: {
      placeName: "",
      coordinates: {
        lat: 1,
        lng: 1,
      },
    },
    pickUp_date: "",
    vehiculeType: "",
    luggage: "",
    journeyType: "",
    droppOff_date: "",
    freeDays_date: [""],
    exceptDays: [""],
    recommanded_capacity: "",
    extra: [""],
    notes: "",
    dropOff_time: "",
    pickUp_Time: "",
    workDates: [""],
    company_id: "",
    program_status: [
      {
        status: "",
        date_status: "",
      },
    ],
  });
  const notify = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Program created successfully",
      showConfirmButton: false,
      timer: 2000,
    });
  };
  const onChangeProgramms = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProgrammData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onChangeProgrammsSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgrammData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onChangeProgrammsNotes = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProgrammData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmitProgramm = (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      createProgram(programmData)
        .then(() => notify())
        .then(() => navigate("/programming/list-of-programs"));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddStopClick = (address: string) => {
    console.log("stops2", stops2);
    setStops2((prevStops) => [
      ...prevStops,
      { id: prevStops.length + 1, address },
    ]);
  };

  const handleRemoveStopClick = (idToRemove: any) => {
    console.log(waypts);
    setStops2((prevStops) => {
      console.log("handleRemoveStopClick called with ID:", idToRemove);
      const updatedStops = prevStops.filter((stop) => stop.id !== idToRemove);

      return updatedStops;
    });

    const newWaypts = [...waypts];
    newWaypts.splice(idToRemove - 1, 1);
    console.log(newWaypts);
    setWaypts(newWaypts);
    console.log(waypts);
    calculateRoute();
  };

  const handleAddStopClickWrapper = (address: string) => {
    return () => handleAddStopClick(address);
  };

  useEffect(() => {
    if (originRef.current && destinationRef.current) {
      setRecap((prevRecap) => ({
        ...prevRecap,
        programName,
        capacityRecommanded,
        selected,
        selected1,
        stops,
        originRef: originRef.current.value,
        destinationRef: destinationRef.current.value,
        dropOff_date: dropOff_date ? dropOff_date.toString() : "",
        dropOff_time: dropOff_time ? dropOff_time.toString() : "",
        free_date:
          free_date.length > 0 ? free_date.map((date) => date.toString()) : [],
        pickUp_date: pickUp_date ? pickUp_date.toString() : "",
        pickUp_time: pickUp_time ? pickUp_time.toString() : "",
      }));
    }
  }, [
    programName,
    capacityRecommanded,
    selected,
    selected1,
    stops,
    originRef,
    destinationRef,
    dropOff_date,
    dropOff_time,
    free_date,
    pickUp_date,
    pickUp_time,
  ]);
  var hours = String(
    Math.floor(
      (Number(test2!) / 60 +
        pickUp_time?.getMinutes()! +
        pickUp_time?.getHours()! * 60) /
        60
    )
  ).padStart(2, "0");

  var minutes = String(
    Math.round(
      (Number(test2!) / 60 +
        pickUp_time?.getMinutes()! +
        pickUp_time?.getHours()! * 60) %
        60
    )
  ).padStart(2, "0");
  console.log(hours + ":" + minutes);

  const handlePickupTime = (selectedDates: any) => {
    const formattedTime = selectedDates[0];
    // .toLocaleTimeString([], {
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
    setPickUp_time(formattedTime);
    console.log("Hello Fatma");
  };

  const handleStopTime = (selectedTime: any, index: number) => {
    console.log("indexx", index);
    const formattedTime = selectedTime[0];
    console.log(formattedTime);
    let hour = formattedTime?.getHours();
    let minute = formattedTime?.getMinutes();

    let tempStopTimes = [...stopTimes];

    let newSelectedTime =
      String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
    console.log("newSelectedTime", newSelectedTime);

    tempStopTimes[index] = {
      hours: hour,
      minutes: minute,
    };

    let apiTime =
      String(stopTimes[index].hours).padStart(2, "0") +
      ":" +
      String(stopTimes[index].minutes).padStart(2, "0");

    let comparisonTime = compareTimes(apiTime, newSelectedTime);

    let duration = {
      hours: 0,
      minutes: 0,
    };

    if (comparisonTime === 2) {
      duration = calculateDuration(apiTime, newSelectedTime);
      console.log("duration", duration);
    }
    if (comparisonTime === 1) {
      duration = calculateDuration(newSelectedTime, apiTime);
      console.log("duration", duration);
    }
    for (let i = index + 1; i < stopTimes.length; i++) {
      let oldTime =
        String(stopTimes[i].hours).padStart(2, "0") +
        ":" +
        String(stopTimes[i].minutes).padStart(2, "0");

      let newTime = {
        hours: 0,
        minutes: 0,
      };
      if (comparisonTime === 2) {
        newTime = addDurationToTime(oldTime, duration.hours, duration.minutes);
      }

      if (comparisonTime === 1) {
        newTime = subtractTime(oldTime, duration.hours, duration.minutes);
      }

      tempStopTimes[i].hours = newTime.hours;
      tempStopTimes[i].minutes = newTime.minutes;
    }

    setStopTimes(tempStopTimes);
    console.log("stoptimes", stopTimes);
  };

  const handleDateClose = (selectedDates: any) => {
    let tempStopTimes = stopTimes;
    console.log("Selected date:", selectedDates[0]);
    for (let i = 0; i < tempStopTimes.length; i++) {
      tempStopTimes[i].hours = 0;
      tempStopTimes[i].minutes = 0;
    }
    setStopTimes(tempStopTimes);
    console.log("stoptimes", stopTimes);
  };

  const handleDateChange1 = (selectedDates: Date[]) => {
    setPickUp_date(selectedDates[0]);
  };
  const handleDateChange2 = (selectedDates: Date[]) => {
    setDropOff_date(selectedDates[0]);
  };

  const handleDateChange3 = (selectedDates: Date[]) => {
    setFree_date(selectedDates);
  };

  const getWorkDates = () => {
    let workDates = [];

    let startDate = pickUp_date;
    let endDate = dropOff_date;

    if (startDate && endDate && endDate >= startDate) {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (
          !free_date.find(
            (freeDay) => freeDay.toDateString() === currentDate.toDateString()
          )
        ) {
          if (
            !selected1.includes(
              currentDate.toLocaleString("en-us", { weekday: "long" })
            )
          ) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate().toLocaleString();

            let date =
              String(year) +
              "-" +
              String(month).padStart(2, "0") +
              "-" +
              String(day).padStart(2, "0");
            workDates.push(date);
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    // console.log("workDates", workDates);
    return workDates;
  };

  const tileClassName = ({ date }: any) => {
    const formattedDate = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const dayOfWeek = date.getDay();
    if (date < pickUp_date! || date > dropOff_date!) {
      return null;
    }

    let testDays = [];
    for (let freeDay of programmData.freeDays_date) {
      let day = createDateFromStrings(freeDay, "00:00:00");

      let year = day.getFullYear();
      let month = day.getMonth() + 1;
      let d = day.getDate().toLocaleString();

      let free_day = String(year) + "-" + String(month) + "-" + String(d);
      testDays.push(free_day);
    }

    if (testDays.includes(formattedDate)) {
      return "free-day";
    }
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    if (
      selectedDays.includes(options1[adjustedIndex].value) ||
      selected1.includes(options1[adjustedIndex].value)
    ) {
      return "selected-day";
    }

    return null;
  };

  const handleDayClick = (value: Date) => {
    const dayOfWeek = value.getDay();
    const selectedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const selectedDay = options1[selectedDayIndex].value;

    if (selectedDays.includes(selectedDay) || selected1.includes(selectedDay)) {
      setSelectedDays(selectedDays.filter((day) => day !== selectedDay));
      setSelected1(selected1.filter((day) => day !== selectedDay));
    } else {
      setSelectedDays([...selectedDays, selectedDay]);
      setSelected1([...selected1, selectedDay]);
    }
  };

  const tileDisabled = ({ date }: any) => {
    return date < pickUp_date! || date > dropOff_date!;
  };

  const renderRecapPage = () => {
    return (
      <>
        <Row className="d-flex resume-title">
          <span className="title"> Journey Name: </span>{" "}
          <span className="title-value">{programmData.programName}</span>
        </Row>
        <Row className="d-flex justify-content-space-between">
          <Col>
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle description-table">
                <tbody>
                  <tr>
                    <td>
                      <b>Start Date </b>
                      <p>{programmData.pickUp_date}</p>
                    </td>
                    <td>
                      <b>End Date </b>
                      <p>{programmData.droppOff_date}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>Origin Address</b>
                      <p>{programmData.origin_point.placeName}</p>
                    </td>
                    <td>
                      <b>Pick Up Time </b> <p> {programmData.pickUp_Time}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b> Destination Address: </b>
                      <p> {programmData.destination_point.placeName}</p>
                    </td>
                    <td>
                      <b>Drop Off Time </b> <p> {programmData.dropOff_time}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>List of Stops</b>
                    </td>
                    <td>
                      <b>Stop Time</b>
                    </td>
                  </tr>

                  {waypts.map((value, index) => (
                    <tr key={index}>
                      <td>{value.location?.toString()}</td>
                      <td>
                        {String(stopTimes[index]?.hours).padStart(2, "0") +
                          ":" +
                          String(stopTimes[index]?.minutes).padStart(2, "0")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col>
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle description-table">
                <tbody>
                  <tr>
                    <td>
                      <b>Capacity Recommended</b>{" "}
                      <p> {programmData.recommanded_capacity}</p>
                    </td>
                    <td>
                      <p className="legend-container">
                        Excepted days{" "}
                        <span className="legend bg-except-day"></span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b> Selected Options </b>{" "}
                      <p>{programmData.extra.join(", ")}</p>
                    </td>
                    <td>
                      <p className="legend-container">
                        Current day <span className="legend bg-now-day"></span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <p className="legend-container">
                        Free days <span className="legend bg-free-day"></span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
        <b>Work Dates: </b>
        <br />

        <div className="calender-container">
          <Calendar tileClassName={tileClassName} tileDisabled={tileDisabled} />
        </div>
      </>
    );
  };

  // const isJourneyStepValid = () => {
  //   return (
  //     journeyName.trim() !== "" &&
  //     originRef.current?.value.trim() !== "" &&
  //     destinationRef.current?.value.trim() !== ""
  //   );
  // };
  const isJourneyStepValid = () => {
    return (
      programmData.programName.trim() !== ""

      // originRef.current?.value.trim() !== "" &&
      // destinationRef.current?.value.trim() !== ""
    );
  };

  const isTripTimesStepValid = () => {
    const pickupTimeInput = document.getElementById(
      "pickUp_time"
    ) as HTMLInputElement | null;
    const dropoffTimeInput = document.getElementById(
      "dropOff_time"
    ) as HTMLInputElement | null;
    const pickupTime = pickupTimeInput?.value ?? "";
    const dropoffTime = dropoffTimeInput?.value ?? "";

    return pickupTime.trim() !== "" && dropoffTime.trim() !== "";
  };

  const isRunDatesStepValid = () => {
    const startDateInput = document.getElementById(
      "pickUp_date"
    ) as HTMLInputElement | null;
    const endDateInput = document.getElementById(
      "dropOff_date"
    ) as HTMLInputElement | null;

    const startDate = startDateInput?.value ?? "";
    const endDate = endDateInput?.value ?? "";
    return startDate.trim() !== "" && endDate.trim() !== "";
  };
  const isOptionsStepValid = () => {
    return selected1.length > 0;
  };

  const isFreeDaysStepValid = () => {
    const freeDateInput = document.getElementById(
      "free_date"
    ) as HTMLInputElement | null;
    const freeDate = freeDateInput?.value ?? "";
    return freeDate.trim() !== "";
  };

  const isRecommandedCapacityStepValid = () => {
    return programmData.recommanded_capacity.trim() !== "";
  };

  const isNextButtonDisabled = () => {
    switch (activeVerticalTab) {
      case 1:
        return !isJourneyStepValid();

      case 2:
        return (
          !isRunDatesStepValid() ||
          !isOptionsStepValid() ||
          !isFreeDaysStepValid()
        );
      case 3:
        return !isRecommandedCapacityStepValid();
      default:
        return false;
    }
  };
  const handleNextStep = (isResume: boolean) => {
    if (isResume === true) {
      programmData["extra"] = selected;
      programmData["company_id"]= user?._id!
      programmData["program_status"] = [
        {
          status: "Pending",
          date_status: "",
        },
      ];
      programmData["exceptDays"] = selected1;
      programmData["workDates"] = getWorkDates();

      let freeDates = [];

      for (let freeDay of free_date) {
        const year = freeDay.getFullYear();
        const month = freeDay.getMonth() + 1;
        const day = freeDay.getDate().toLocaleString();

        let date =
          String(year) +
          "-" +
          String(month).padStart(2, "0") +
          "-" +
          String(day).padStart(2, "0");

        freeDates.push(date);
      }

      console.log(freeDates);
      programmData["freeDays_date"] = freeDates;
      programmData["journeyType"] = selectedJourney;
      programmData["luggage"] = selectedLuggage;
      programmData['vehiculeType'] = selectedVehicleType;
      programmData['company_id'] = user?._id! ;

      const dropYear = dropOff_date!.getFullYear();
      const dropMonth = dropOff_date!.getMonth() + 1;
      const dropDay = dropOff_date!.getDate().toLocaleString();

      let dropOffDate =
        String(dropYear) +
        "-" +
        String(dropMonth).padStart(2, "0") +
        "-" +
        String(dropDay).padStart(2, "0");
      programmData["droppOff_date"] = dropOffDate;

      const pickYear = pickUp_date!.getFullYear();
      const pickMonth = pickUp_date!.getMonth() + 1;
      const pickDay = pickUp_date!.getDate().toLocaleString();

      let pickUpDate =
        String(pickYear) +
        "-" +
        String(pickMonth).padStart(2, "0") +
        "-" +
        String(pickDay).padStart(2, "0");
      programmData["pickUp_date"] = pickUpDate;

      let pickUpHour = String(pickUp_time?.getHours()).padStart(2, "0");
      let pickUpMinute = String(pickUp_time?.getMinutes()).padStart(2, "0");

      let pickTime = pickUpHour + ":" + pickUpMinute;

      programmData["pickUp_Time"] = pickTime;

      let destTime =
        String(stopTimes[stopTimes.length - 1]?.hours).padStart(2, "0") +
        ":" +
        String(stopTimes[stopTimes.length - 1]?.minutes).padStart(2, "0");
      programmData["dropOff_time"] = destTime;

      const destinationPoint = destinationRef.current;

      if (
        destinationPoint &&
        destinationPoint.placeName &&
        destinationPoint.coordinates
      ) {
        programmData["destination_point"] = {
          placeName: destinationPoint.placeName,
          coordinates: destinationPoint.coordinates,
        };
      } else {
        console.error("destinationRef does not have the expected properties.");
      }

      const originPoint = originRef.current;

      if (originPoint && originPoint.placeName && originPoint.coordinates) {
        setProgrammData((prevData) => ({
          ...prevData,
          origin_point: {
            placeName: originPoint.placeName,
            coordinates: originPoint.coordinates,
          },
        }));
      } else {
        console.error("originPoint does not have the expected properties.");
      }

      let stops = [];

      for (let i = 0; i < waypts.length; i++) {
        stops.push({
          id: "",
          address: String(waypts[i].location),
          time:
            String(stopTimes[i].hours).padStart(2, "0") +
            ":" +
            String(stopTimes[i].minutes).padStart(2, "0"),
        });
      }

      programmData["stops"] = stops;
    }
    if (!isNextButtonDisabled()) {
      setactiveVerticalTab(activeVerticalTab + 1);
    } else {
      alert("Please fill all required fields before proceeding.");
    }
  };
  if (!isLoaded) {
    return <p>Loading!!!!!</p>;
  }

  function onLoad(autocomplete: any) {
    setSearchResult(autocomplete);
  }

  function onLoadStop(autocomplete: any) {
    setSearchStop(autocomplete);
  }

  function onLoadDest(autocomplete: any) {
    setSearchDestination(autocomplete);
  }

  function onPlaceChanged() {
    if (searchResult != null) {
      const place = (
        searchResult as unknown as google.maps.places.Autocomplete
      ).getPlace();
      const name = place.name;
      const location = place.geometry?.location;

      if (location) {
        const coordinates = { lat: location.lat(), lng: location.lng() };

        setRecap((prevRecap) => ({
          ...prevRecap,
          originRef: name ?? '',
        }));

        setProgrammData((prevData) => ({
          ...prevData,
          origin_point: {
            placeName: name ?? '',
            coordinates: coordinates,
          },
        }));

        const status = place.business_status;
        const formattedAddress = place.formatted_address;
        console.log(`Name: ${name}`);
        console.log(`Business Status: ${status}`);
        console.log(`Formatted Address: ${formattedAddress}`);
      } else {
        console.error("Location not found in place object");
      }
    } else {
      alert("Please enter text");
    }
  }

  function onPlaceChangedStop() {
    if (searchStop != null) {
      const place = (
        searchStop as unknown as google.maps.places.Autocomplete
      ).getPlace();
      const name = place.name;
      console.log("place", place);
      const location = place.geometry?.location;
      if (location) {
        const nom = { lat: location.lat(), lng: location.lng() };
        setStop(nom);

        const status = place.business_status;
        const formattedAddress = place.formatted_address;
        const wayPoint = {
          location: formattedAddress,
          stopover: true,
        };
        setWaypts((waypts) => [...waypts, wayPoint]);

        console.log(`Name: ${name}`);
        console.log(`Business Status: ${status}`);
        console.log(`Formatted Address: ${formattedAddress}`);
      } else {
        console.error("Location not found in place object");
      }
    } else {
      alert("Please enter text");
    }
  }

  function onPlaceChangedDest() {
    if (searchDestination != null) {
      const place = (
        searchDestination as unknown as google.maps.places.Autocomplete
      ).getPlace();
      const name = place.name;
      const location = place.geometry?.location;

      if (location) {
        const coordinates = { lat: location.lat(), lng: location.lng() };

        setRecap((prevRecap) => ({
          ...prevRecap,
          destinationRef: name ?? '',
        }));

        setProgrammData((prevData) => ({
          ...prevData,
          destination_point: {
            placeName: name ?? '',
            coordinates: coordinates,
          },
        }));

        const status = place.business_status;
        const formattedAddress = place.formatted_address;
        console.log(`Name: ${name}`);
        console.log(`Business Status: ${status}`);
        console.log(`Formatted Address: ${formattedAddress}`);
      } else {
        console.error("Location not found in place object");
      }
    } else {
      alert("Please enter text");
    }
  }

  const handleLocationButtonClick = () => {
    setSelectedLocation(nom);
  };
  const handleLocationButtonClickStop = () => {
    setSelectedStop(stop);
  };

  const handleLocationButtonClickDest = () => {
    setSelectedDestination(fatma);
  };

  function clearRoute() {
    setDirectionsResponse(null);
    setLoading(false);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }

  async function calculateRoute(): Promise<void> {
    setOriginSwitchRef(originRef?.current!.value);
    setDestSwitchRef(destinationRef?.current!.value);

    if (
      originRef?.current!.value === "" ||
      destinationRef?.current!.value === "" ||
      !map
    ) {
      console.error("Invalid inputs or map not loaded.");
      return;
    }

    setLoading(true);

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypts,
      },
      (result, status) => {
        setLoading(false);

        if (status === google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          setRouteDirections(result);
          console.log(result)

          const selectedRoute = result!.routes.find((route) => {
            const segments = route.legs.map((leg, index) => ({
              segment: index + 1,
              startAddress: leg.start_address,
              endAddress: leg.end_address,
              distance: leg.distance!.text,
              duration: leg.duration!.text,
            }));
            setRouteSegments(segments);

            let durations = route.legs.map((leg, index) => ({
              duration: leg?.duration?.value,
            }));
            console.log("durations", durations);
            const hours_first = Math.floor(durations[0]?.duration! / 3600);
            const minutes_first = Math.floor(
              (durations[0]?.duration! % 3600) / 60
            );

            let pickUpHour = String(pickUp_time?.getHours()).padStart(2, "0");
            let pickUpMinute = String(pickUp_time?.getMinutes()).padStart(
              2,
              "0"
            );

            const time_first = addDurationToTime(
              pickUpHour + ":" + pickUpMinute,
              hours_first,
              minutes_first
            );
            let temporarryTimes = [time_first];
            console.log("temporarryTimes", temporarryTimes);
            for (let i = 1; i < durations.length; i++) {
              const hours = Math.floor(durations[i]?.duration! / 3600);
              const minutes = Math.floor((durations[i].duration! % 3600) / 60);

              const time = addDurationToTime(
                String(temporarryTimes[i - 1]?.hours) +
                  ":" +
                  String(temporarryTimes[i - 1]?.minutes),
                hours,
                minutes
              );
              temporarryTimes.push(time);
            }
            console.log(temporarryTimes);
            setStopTimes(temporarryTimes);
            console.log("Plan route stop times", stopTimes);
          });

          if (!selectedRoute) {
            return;
          }

          if (map && directionsResponse) {
            const directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(directionsResponse);
          }
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  }

  const createDateFromStrings = (YyyyMmDd: string, HhMmSs: string) => {
    //*var d1 = new Date('2020-03-10, 10:10:10'); //
    let date = new Date(YyyyMmDd + ", " + HhMmSs);
    return date;
  };

  const addDurationToTime = (
    time: string,
    hoursToAdd: number,
    minutesToAdd: number
  ) => {
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    totalMinutes += hoursToAdd * 60 + minutesToAdd;

    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return {
      hours: newHours,
      minutes: newMinutes,
    };
  };
  const subtractTime = (
    time: string,
    hoursToSubtract: number,
    minutesToSubtract: number
  ) => {
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    totalMinutes -= hoursToSubtract * 60 + minutesToSubtract;

    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours if the result is negative
    }

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    // return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
    //   2,
    //   "0"
    // )}`;

    return {
      hours: newHours,
      minutes: newMinutes,
    };
  };
  const calculateDuration = (startTime: string, endTime: string) => {
    console.log("startTime", startTime);
    console.log("endTime", endTime);
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    let totalStartMinutes = startHours * 60 + startMinutes;
    let totalEndMinutes = endHours * 60 + endMinutes;

    let durationInMinutes = totalEndMinutes - totalStartMinutes;

    if (durationInMinutes < 0) {
      durationInMinutes += 24 * 60;
    }

    const durationHours = Math.floor(durationInMinutes / 60);
    const durationMinutes = durationInMinutes % 60;

    let duration = {
      hours: durationHours,
      minutes: durationMinutes,
    };

    return duration;
    //return `${durationHours} hours and ${durationMinutes} minutes`;
  };
  const compareTimes = (time1: string, time2: string) => {
    let ref = 0;
    if (time1 > time2) {
      ref = 1;
    } else if (time1 < time2) {
      ref = 2;
    }
    return ref;
  };

  const accumulateDurations = (durations: any) => {
    console.log("Api durations", durations);
    let totalDuration = {
      hours: 0,
      minutes: 0,
    };
    for (let duration of durations) {
      const hours = Math.floor(duration.duration / 3600);
      const minutes = Math.floor((duration.duration % 3600) / 60);
      totalDuration.hours += hours;
      totalDuration.minutes += minutes;
      console.log("Tempo Total", totalDuration);
    }

    let totalMinutes = totalDuration.hours * 60 + totalDuration.minutes;

    let validHours = Math.floor(totalMinutes / 60) % 24;
    let valdMinutes = totalMinutes % 60;

    let total = {
      hours: validHours,
      minutes: valdMinutes,
    };

    console.log("Total", total);

    return total;
  };
  const getPreviousDay = (date: string) => {
    let t = createDateFromStrings(date, "00:00:00");
    t.setDate(t.getDate() - 1);
    // return t.toISOString().split("T")[0];
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const day = t.getDate().toLocaleString();

    let prevDate =
      String(year) +
      "-" +
      String(month).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0");

    return prevDate;
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Add New Program" pageTitle="Programming" />
          <Card className="overflow-hidden">
            <Card.Header className="border-0">
              <div className="hstack gap-2 justify-content-end">
                <Button variant="success" id="add-btn" className="btn-sm">
                  Save & Send
                </Button>
                {/* <Button variant="info" id="add-btn" className="btn-sm">
                  Quick Save
                </Button> */}
              </div>
            </Card.Header>
            <Card.Body className="form-steps">
              <Card>
                <Card.Body className="form-steps" style={{ height: "80vh" }}>
                  <Form
                    className="vertical-navs-step"
                    onSubmit={onSubmitProgramm}
                  >
                    <Tab.Container activeKey={activeVerticalTab}>
                      <Tab.Content>
                        <Tab.Pane eventKey="1">
                          <Row>
                            <Col lg={4}>
                              <div
                                style={{
                                  maxHeight: "calc(80vh - 80px)",
                                  overflowX: "auto",
                                }}
                              >
                                <Form.Label htmlFor="programName">
                                  Name
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  id="programName"
                                  style={{ width: "450px" }}
                                  required
                                  className="mb-2"
                                  placeholder="Add Program Name"
                                  name="programName"
                                  value={programmData.programName}
                                  onChange={onChangeProgramms}
                                />
                                <Form.Label htmlFor="customerName-field">
                                  coordinations
                                </Form.Label>

                                <InputGroup className="mb-3">
                                  <InputGroup.Text id="basic-addon1">
                                    From
                                  </InputGroup.Text>
                                  <div className="d-flex">
                                    <Autocomplete
                                      onPlaceChanged={onPlaceChanged}
                                      onLoad={onLoad}
                                    >
                                      <Form.Control
                                        type="text"
                                        style={{ width: "285px" }}
                                        placeholder="Origin"
                                        ref={originRef}
                                        id="origin"
                                        onClick={() => {
                                          handleLocationButtonClick();
                                          if (nom) {
                                            map?.panTo(nom);
                                            map?.setZoom(15);
                                          }
                                        }}
                                        onChange={onChangeProgramms}
                                        required
                                      />
                                    </Autocomplete>
                                    <Flatpickr
                                      className="form-control"
                                      id="pickUp_time"
                                      style={{ width: "100px" }}
                                      options={{
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: "H:i",
                                        time_24hr: true,
                                        onChange: handlePickupTime,
                                      }}
                                    />
                                  </div>
                                  {/* <p>{pickUp_time?.toDateString()}</p> */}
                                </InputGroup>
                                <InputGroup className="mb-3">
                                  <InputGroup.Text id="basic-addon1">
                                    To
                                  </InputGroup.Text>
                                  <div className="d-flex">
                                    <Autocomplete
                                      onPlaceChanged={onPlaceChangedDest}
                                      onLoad={onLoadDest}
                                    >
                                      <Form.Control
                                        type="text"
                                        style={{ width: "300px" }}
                                        placeholder="Destination"
                                        ref={destinationRef}
                                        id="dest"
                                        onClick={() => {
                                          handleLocationButtonClickDest();
                                          if (fatma) {
                                            map?.panTo(fatma);
                                            map?.setZoom(15);
                                          }
                                        }}
                                        onChange={onChangeProgramms}
                                        required
                                      />
                                    </Autocomplete>
                                    <Flatpickr
                                      className="form-control"
                                      id="pickUp_time"
                                      style={{ width: "100px" }}
                                      value={createDateFromStrings(
                                        String(
                                          new Date().getFullYear()
                                        ).padStart(2, "0") +
                                          "-" +
                                          String(
                                            new Date().getMonth() + 1
                                          ).padStart(2, "0") +
                                          "-" +
                                          String(
                                            new Date()
                                              .getDate()
                                              .toLocaleString()
                                          ).padStart(2, "0"),
                                        stopTimes[stopTimes.length - 1]?.hours +
                                          ":" +
                                          stopTimes[stopTimes.length - 1]
                                            ?.minutes +
                                          ":00"
                                      ).getTime()}
                                      disabled={true}
                                      options={{
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: "H:i",
                                        time_24hr: true,
                                      }}
                                    />
                                  </div>
                                </InputGroup>

                                {loading ? (
                                  <p>Calculating route...</p>
                                ) : (
                                  <Button
                                    type="submit"
                                    onClick={calculateRoute}
                                    className="custom-button"
                                  >
                                    Plan Route
                                  </Button>
                                )}

                                <div style={{ marginTop: "20px" }}>
                                  {stops2.map((stop, index) => (
                                    <Row>
                                      <Col lg={6} key={index}>
                                        <Form.Label htmlFor="customerName-field">
                                          Stop {index + 1}
                                        </Form.Label>
                                        <div className="mb-3 d-flex">
                                          <Autocomplete
                                            onPlaceChanged={onPlaceChangedStop}
                                            onLoad={onLoadStop}
                                          >
                                            <Form.Control
                                              type="text"
                                              style={{ width: "280px" }}
                                              placeholder="Stop"
                                              ref={stopRef}
                                              id="stop"
                                              onClick={() => {
                                                handleLocationButtonClickStop();
                                              }}
                                            />
                                          </Autocomplete>
                                          {
                                            <Flatpickr
                                              className="form-control"
                                              style={{ width: "100px" }}
                                              id="pickUp_time"
                                              value={createDateFromStrings(
                                                String(
                                                  new Date().getFullYear()
                                                ).padStart(2, "0") +
                                                  "-" +
                                                  String(
                                                    new Date().getMonth() + 1
                                                  ).padStart(2, "0") +
                                                  "-" +
                                                  String(
                                                    new Date()
                                                      .getDate()
                                                      .toLocaleString()
                                                  ).padStart(2, "0"),
                                                stopTimes[index]?.hours +
                                                  ":" +
                                                  stopTimes[index]?.minutes +
                                                  ":00"
                                              ).getTime()}
                                              options={{
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true,
                                              }}
                                              onChange={(selectedDates) =>
                                                handleStopTime(
                                                  selectedDates,
                                                  index
                                                )
                                              }
                                            />
                                          }
                                        </div>
                                      </Col>

                                      <button
                                        type="button"
                                        className="btn btn-danger btn-icon"
                                        onClick={() =>
                                          handleRemoveStopClick(stop.id)
                                        }
                                        style={{
                                          marginTop: "29px",
                                          marginLeft: "152px",
                                        }}
                                      >
                                        <i className="ri-delete-bin-5-line"></i>
                                      </button>
                                    </Row>
                                  ))}
                                  <div className="d-flex flex-btn-via">
                                    <Link
                                      to="#"
                                      id="add-item"
                                      className="btn btn-soft-dark fw-medium"
                                      onClick={handleAddStopClickWrapper(
                                        "New Stop Address"
                                      )}
                                      style={{ width: "150px" }}
                                    >
                                      <i className="ri-add-line label-icon align-middle rounded-pill fs-16 me-2">
                                        {" "}
                                        Via
                                      </i>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </Col>

                            <Col lg={8}>
                              <div
                                style={{
                                  position: "absolute",
                                  left: "0",
                                  height: "530px",
                                  width: "2350px",
                                }}
                              >
                                <GoogleMap
                                  center={center}
                                  zoom={15}
                                  mapContainerStyle={{
                                    width: isMapFullScreen ? "100vw" : "43%",
                                    height: isMapFullScreen ? "100vh" : "120%",
                                  }}
                                  options={{
                                    zoomControl: false,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    fullscreenControl: true,

                                    fullscreenControlOptions: {
                                      position:
                                        google.maps.ControlPosition.TOP_RIGHT,
                                    },
                                  }}
                                  onLoad={(map) => setMap(map)}
                                >
                                  {selectedLocation && (
                                    <Marker position={nom} />
                                  )}
                                  {selectedDestination && (
                                    <Marker position={fatma} />
                                  )}
                                  {directionsResponse && (
                                    <DirectionsRenderer
                                      directions={directionsResponse}
                                    />
                                  )}
                                </GoogleMap>
                                <Button
                                  aria-label="center back"
                                  onClick={clearRoute}
                                  variant="danger"
                                  style={{
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                    zIndex: 1000,
                                    marginLeft: "15px",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    width="20"
                                    height="20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.146 14.146a.5.5 0 0 1-.708 0L8.5 7.207l-3.938 3.937a.5.5 0 0 1-.707-.707l4.146-4.146a1.5 1.5 0 0 1 2.121 0l6 6a.5.5 0 0 1 0 .708zM6.646 9.354a.5.5 0 0 1 .708 0L8 10.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"
                                    />
                                  </svg>
                                  Clear Route
                                </Button>
                              </div>
                              <div
                                className="d-flex align-items-end"
                                style={{ marginTop: "670px" }}
                              >
                                <Dropdown style={{ marginLeft: "0" }}>
                                  <Dropdown.Toggle
                                    variant="light"
                                    id="dropdown-basic"
                                  >
                                    Route Information
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {routeSegments.map((segment, index) => (
                                      <Dropdown.Item key={index}>
                                        <div>
                                          <p>
                                            Route Segment: {segment.segment}
                                          </p>
                                          <p>
                                            {segment.startAddress} To{" "}
                                            {segment.endAddress}
                                          </p>
                                          <p>{segment.distance}</p>
                                          <p>{segment.duration}</p>
                                        </div>
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Menu>
                                </Dropdown>
                                <Button
                                  type="button"
                                  className="btn btn-success btn-label right ms-auto nexttab "
                                  onClick={() => handleNextStep(false)}
                                  disabled={isNextButtonDisabled()}
                                >
                                  <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                  Set Run dates
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Tab.Pane>

                        <Tab.Pane eventKey="2">
                          <Row>
                            <div className="mt-2">
                              <h5>Run Dates</h5>
                            </div>
                            <Col lg={5}>
                              <InputGroup>Start Date</InputGroup>
                              <div className="mb-3">
                                <Flatpickr
                                  value={pickUp_date!}
                                  onChange={handleDateChange1}
                                  className="form-control flatpickr-input"
                                  id="pickUp_date"
                                  placeholder="Select Date"
                                  options={{
                                    dateFormat: "d M, Y",
                                    onChange: (selectedDates: Date[]) => {
                                      setPickUp_date(selectedDates[0]);
                                    },
                                  }}
                                />
                              </div>
                            </Col>
                            <Col className="d-flex justify-content-center align-items-center">
                              <h5>to</h5>
                            </Col>
                            <Col lg={5}>
                              <InputGroup>End Date</InputGroup>

                              <Flatpickr
                                value={dropOff_date!}
                                onChange={handleDateChange2}
                                className="form-control flatpickr-input"
                                id="dropOff_date"
                                placeholder="Select Date"
                                options={{
                                  dateFormat: "d M, Y",
                                  onChange: (selectedDates: Date[]) => {
                                    setDropOff_date(selectedDates[0]);
                                  },
                                }}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <div className="mt-2">
                              <h5>Free Days</h5>
                            </div>
                            <Col lg={5}>
                              <Flatpickr
                                value={free_date!}
                                onChange={handleDateChange3}
                                className="form-control flatpickr-input"
                                id="free_date"
                                placeholder="Select Date"
                                options={{
                                  dateFormat: "d M, Y",
                                  mode: "multiple",
                                  onChange: (selectedDates: Date[]) => {
                                    setFree_date(selectedDates);
                                  },
                                }}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={12}>
                              <div className="mt-2">
                                <h5 className="fs-14 mb-1">
                                  Days of week not running
                                </h5>
                                <p className="text-muted">
                                  Slide the selected excepted days to the right
                                </p>
                                <DualListBox
                                  options={options1}
                                  selected={selected1}
                                  onChange={(e: any) => {
                                    console.log("event", e);
                                    setSelected1(e);
                                  }}
                                  icons={{
                                    moveLeft: (
                                      <span
                                        className="mdi mdi-chevron-left"
                                        key="key"
                                      />
                                    ),
                                    moveAllLeft: [
                                      <span
                                        className="mdi mdi-chevron-double-left"
                                        key="key"
                                      />,
                                    ],
                                    moveRight: (
                                      <span
                                        className="mdi mdi-chevron-right"
                                        key="key"
                                      />
                                    ),
                                    moveAllRight: [
                                      <span
                                        className="mdi mdi-chevron-double-right"
                                        key="key"
                                      />,
                                    ],
                                    moveDown: (
                                      <span
                                        className="mdi mdi-chevron-down"
                                        key="key"
                                      />
                                    ),
                                    moveUp: (
                                      <span
                                        className="mdi mdi-chevron-up"
                                        key="key"
                                      />
                                    ),
                                    moveTop: (
                                      <span
                                        className="mdi mdi-chevron-double-up"
                                        key="key"
                                      />
                                    ),
                                    moveBottom: (
                                      <span
                                        className="mdi mdi-chevron-double-down"
                                        key="key"
                                      />
                                    ),
                                  }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <div
                            className="d-flex align-items-start gap-3"
                            style={{ marginTop: "250px" }}
                          >
                            <Button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => setactiveVerticalTab(1)}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back to Journey
                            </Button>
                            <Button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              onClick={() => handleNextStep(false)}
                              disabled={isNextButtonDisabled()}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Add Options
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="3">
                          <Row>
                            <Col lg={6}>
                              <div className="mb-3">
                                <Form.Label htmlFor="recommanded_capacity">
                                  Recommanded Capacity
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  id="recommanded_capacity"
                                  required
                                  className="mb-2"
                                  name="recommanded_capacity"
                                  value={programmData.recommanded_capacity}
                                  onChange={onChangeProgramms}
                                />
                              </div>
                            </Col>
                            <Col lg={6}>
                              <div className="mb-3">
                                <Form.Label htmlFor="vehicleType">
                                  Vehicle Type
                                </Form.Label>
                                <div>
                                  <select
                                    className="form-select text-muted"
                                    name="vehicleType"
                                    id="vehicleType"
                                    onChange={handleSelectVehicleType}
                                  >
                                    <option value="">
                                      Select Vehicle Type
                                    </option>
                                    {AllVehicleTypes.map((vehicleType) => (
                                      <option
                                        value={vehicleType._id}
                                        key={vehicleType._id}
                                      >
                                        {vehicleType.type}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={6}>
                              <div className="mb-4">
                                <Form.Label htmlFor="journeyType">
                                  Journey Type
                                </Form.Label>
                                <select
                                  className="form-select text-muted"
                                  name="journeyType"
                                  id="journeyType"
                                  onChange={handleSelectJourney}
                                >
                                  <option value="">Select Journey Type</option>
                                  {AllJourneys.map((journeys) => (
                                    <option
                                      value={journeys._id}
                                      key={journeys._id}
                                    >
                                      {journeys.type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </Col>

                            <Col lg={6}>
                              <div className="mb-3">
                                <Form.Label htmlFor="luggageDetails">
                                  Luggage Details
                                </Form.Label>
                                <select
                                  className="form-select text-muted"
                                  name="luggageDetails"
                                  id="luggageDetails"
                                  onChange={handleSelectLuggage}
                                >
                                  <option value="">Select Luggage</option>
                                  {AllLuggages.map((Luggage) => (
                                    <option
                                      value={Luggage._id}
                                      key={Luggage._id}
                                    >
                                      {Luggage.description}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={12}>
                              <div>
                                <h5 className="fs-14 mb-1">Extra</h5>
                                <p className="text-muted">
                                  Slide the selected option to the right
                                </p>
                                <DualListBox
                                  options={options}
                                  selected={selected}
                                  onChange={(e: any) => setSelected(e)}
                                  icons={{
                                    moveLeft: (
                                      <span
                                        className="mdi mdi-chevron-left"
                                        key="key"
                                      />
                                    ),
                                    moveAllLeft: [
                                      <span
                                        className="mdi mdi-chevron-double-left"
                                        key="key"
                                      />,
                                    ],
                                    moveRight: (
                                      <span
                                        className="mdi mdi-chevron-right"
                                        key="key"
                                      />
                                    ),
                                    moveAllRight: [
                                      <span
                                        className="mdi mdi-chevron-double-right"
                                        key="key"
                                      />,
                                    ],
                                    moveDown: (
                                      <span
                                        className="mdi mdi-chevron-down"
                                        key="key"
                                      />
                                    ),
                                    moveUp: (
                                      <span
                                        className="mdi mdi-chevron-up"
                                        key="key"
                                      />
                                    ),
                                    moveTop: (
                                      <span
                                        className="mdi mdi-chevron-double-up"
                                        key="key"
                                      />
                                    ),
                                    moveBottom: (
                                      <span
                                        className="mdi mdi-chevron-double-down"
                                        key="key"
                                      />
                                    ),
                                  }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={12}>
                              <div className="mb-3">
                                <Form.Label htmlFor="VertimeassageInput">
                                  Notes
                                </Form.Label>
                                <textarea
                                  className="form-control"
                                  id="note"
                                  rows={5}
                                  placeholder="Enter your notes"
                                  value={programmData.note}
                                  onChange={onChangeProgrammsNotes}
                                ></textarea>
                              </div>
                            </Col>
                          </Row>

                          <div
                            className="d-flex align-items-start gap-3"
                            style={{ marginTop: "200px" }}
                          >
                            <Button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => setactiveVerticalTab(2)}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back to Run Dates
                            </Button>

                            <Button
                              type="button"
                              className="btn btn-success btn-label right ms-auto nexttab nexttab"
                              onClick={() => handleNextStep(true)}
                              disabled={isNextButtonDisabled()}
                            >
                              <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                              Go To Resume
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="4">
                          <div
                            style={{
                              maxHeight: "calc(80vh - 80px)",
                              overflowY: "auto",
                            }}
                          >
                            {renderRecapPage()}
                          </div>
                          <div
                            className="d-flex justify-content-between"
                            style={{ marginTop: "10px", marginBottom: "15px" }}
                          >
                            <Button
                              type="button"
                              className="btn btn-light btn-label previestab"
                              onClick={() => setactiveVerticalTab(3)}
                            >
                              <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                              Back to Options
                            </Button>

                            <Button
                              variant="success"
                              type="submit"
                              className="w-sm"
                            >
                              Submit
                            </Button>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </Form>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default AddProgramm;