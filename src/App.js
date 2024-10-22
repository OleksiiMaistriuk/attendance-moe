import React, { useEffect, useState } from "react";
import CircleLoader from "react-spinners/CircleLoader";
import "./App.css";
import Modal from "./Modal";
import NameCard from "./NameCard";
import { sendMessage } from './services/discordService';
import { fetchDataFromServer } from "./services/fetchDataFromServer";
import { fetchEmployees } from './services/fetchEmployees';

const ShiftColumn = ({ shiftName, employees, handleCardClick }) => {
  // Sort employees by position number
  const sortedEmployees = employees.sort((a, b) => {
    const positionA = parseInt(a.position, 10);
    const positionB = parseInt(b.position, 10);

    if (isNaN(positionA)) return 1; // If positionA is not a number, place it last
    if (isNaN(positionB)) return -1; // If positionB is not a number, place it last

    return positionA - positionB; // Sort in ascending order
  });

  return (
    <div className="shift-column">
      <h2>{shiftName}</h2>
      {sortedEmployees.length > 0 ? (
        sortedEmployees.map((employee, index) => (
          <div key={index} onClick={() => handleCardClick(employee)}>
            <NameCard
              name={employee.fullName}
              login={employee.login}
              department={employee.department}
              cardId={employee.id}
              discordId={employee.discordId}
              startTime={employee.startTime}
              startBreak={employee.startBreak}
              endBreak={employee.endBreak}
              endTime={employee.endTime}
              position={employee.position}
            />
          </div>
        ))
      ) : (
        <p>{`No employees in Shift ${shiftName}`}</p>
      )}
    </div>
  );
};


function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch employees
  const getEmployees = async () => {
    try {
      const result = await fetchEmployees();
      return result;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  // Fetch time data
  const getTimeData = async () => {
    try {
      const result = await fetchDataFromServer();
      console.log("result", result);
      return result;
    } catch (error) {
      console.error("Error fetching time data:", error);
      return [];
    }
  };


  const mergeEmployeeData = (employeesList, timeDataList) => {
    return employeesList.map((employee) => {
      const matchingTimeData = timeDataList.find((data) => data.id === employee.id);
      if (matchingTimeData) {
        return {
          ...employee,
          startTime: matchingTimeData.startTime || null,
          endTime: matchingTimeData.endTime || null,
          startBreak: matchingTimeData.startBreak || null,
          endBreak: matchingTimeData.endBreak || null,
        };
      }
      return employee;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const employeesList = await getEmployees();
      const timeDataList = await getTimeData();
      const updatedEmployees = mergeEmployeeData(employeesList, timeDataList);
      setEmployees(updatedEmployees);
      setLoading(false);
    };
 
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);
  

  const groupedEmployees = employees.reduce(
    (acc, employee) => {
      const shift = employee.zmiana;
      if (shift === "1" || shift === "2" || shift === "3") {
        acc[shift].push(employee);
      } else {
        acc.Other.push(employee);
      }
      return acc;
    },
    { 1: [], 2: [], 3: [], Other: [] }
  );

  const handleCardClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setMessage("");
  };

  return (
    <div className="App">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner-container">
            <CircleLoader loading={loading} size={150} color="#fff" />
          </div>
        </div>
      )}

      <div className="name-list">
        {["1", "2", "3", "Other"].map((shiftName) => (
          <ShiftColumn
            key={shiftName}
            shiftName={shiftName}
            employees={groupedEmployees[shiftName]}
            handleCardClick={handleCardClick}
          />
        ))}
      </div>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <div>
            <h2>Send a message to {selectedEmployee?.fullName}</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
            />
            <div className="modal-footer">
              <button
                className="send-button"
                onClick={() => {
                  sendMessage(selectedEmployee.discordId, message);
                  handleCloseModal();
                }}
              >
                Send
              </button>
              <button className="cancel-button" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;

