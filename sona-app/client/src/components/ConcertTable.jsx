import { getArtistConcerts, createConcert, deleteConcert } from "../api.js";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ConcertTable({
    artistId,
    isFirstConcert, setIsFirstConcert,
    concerts, setConcerts,
    addRow, setAddRow
}) {
    const { user } = useOutletContext();
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    
    function isValidDate(dateObj) {
        return (
            Object.prototype.toString.call(dateObj) === "[object Date]" && 
            !isNaN(dateObj.getTime())
        );
    }

    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedRows = [...concerts];
        updatedRows[index][name] = value;
        setConcerts(updatedRows);
        setErrors([])
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const newConcert = concerts.at(-1);
        const validationErrors = [];

        if (!newConcert?.date?.trim()) {
            validationErrors.push("The date is missing.");
        } else {
            const dateObj = new Date(newConcert.date.trim());
            if (!isValidDate(dateObj)) {
                validationErrors.push("The date must be in the following format: Month Day, Year. Example: July 31, 2026.");
            }
        }

        if (!newConcert?.venue?.trim()) {
            validationErrors.push("The venue is missing.");
        }

        if (!newConcert?.city?.trim()) {
            validationErrors.push("The city is missing.");
        }

        if (!newConcert?.ticket_link?.trim()) {
            validationErrors.push("The ticket link is missing.");
        } else {
            try {
                const url = new URL(newConcert.ticket_link.trim());
            } catch {
                validationErrors.push("Please check that the ticket link is a valid URL. The link must include https or http protocol. Example: https://example.com");
            }
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        const dateStr = new Date(newConcert.date.trim()).toISOString();
        try {
            // console.log("trying to insert new concert")
            await createConcert(
                user.id,
                artistId,
                newConcert.venue,
                newConcert.city,
                dateStr,
                newConcert.ticket_link
            );
            setErrors([]);
            setAddRow(false);
            setIsFirstConcert(false);
            // navigate(0);
        } catch (error) {
            // console.log(error);
            setErrors(["Something went wrong. " + error.message]);
        }
    };

    const handleCancel = async () => {
        setAddRow(false);
        setErrors([]);
        const updatedConcerts = [...concerts];
        updatedConcerts.splice(-1, 1);
        setConcerts(updatedConcerts);
    }

    async function handleDelete(concertId, date) {
        if (!confirm(`Delete the ${date} concert?`)) return;
        await deleteConcert(concertId, user.id, artistId);
        navigate(0);
    }

return (
    <div>
        {errors.length > 0 && errors.map((error, index) => (
            <p key={index} style={{ color: "#c0392b", fontSize: "13px" }}>
                {error}
            </p>
        ))}
        {concerts.length > 0 &&
            <table>
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Venue</th>
                        <th>City</th>
                        <th>Date</th>
                        <th>Tickets</th>
                        {!addRow && (<th>Delete?</th>)}
                    </tr>
                </thead>
                <tbody>
                    {!isFirstConcert && (addRow ? concerts.slice(0, -1) : concerts).map((concert) => {
                        // console.log(concert)
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        const formattedDate = new Intl.DateTimeFormat('en-US', options)
                                                .format(new Date(concert.date)); 
                        return (
                            <tr key={concert.concert_id}>
                                <td>
                                    <div className="badge">
                                        {concert.source === "manual" ? "Artist" : "Ticketmaster"}
                                    </div>
                                </td>
                                <td>{concert.venue}
                                </td>
                                <td>{concert.city}</td>
                                <td>{formattedDate}</td>
                                <td>
                                    <Link role="button" className="btn" to={concert.ticket_link} target="_blank" rel="noreferrer">
                                        Get Tickets
                                    </Link>
                                </td>
                                {!addRow && (
                                    <td>
                                        <button className="btn-danger btn" onClick={() => handleDelete(concert.concert_id, formattedDate)}>Delete</button>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                    
                    {addRow && (
                        <tr>
                            <td>
                                <input type="text" name="source" placeholder="Artist" disabled />
                            </td>
                            <td>
                                <input type="text" id="venue" name="venue"
                                    value={concerts.at(-1)?.venue}
                                    onChange={(event) => handleChange(concerts.length - 1, event)}
                                />
                            </td>
                            <td>
                                <input type="text" id="city" name="city"
                                    value={concerts.at(-1)?.city}
                                    onChange={(event) => handleChange(concerts.length - 1, event)}
                                />
                            </td>
                            <td>
                                <input type="text" name="date" id="date"
                                    value={concerts.at(-1)?.date}
                                    onChange={(event) => handleChange(concerts.length - 1, event)}
                                />
                            </td>
                            <td>
                                <input type="text" name="ticket_link" id="ticket_link"
                                    value={concerts.at(-1)?.ticket_link}
                                    onChange={(event) => handleChange(concerts.length - 1, event)}
                                />
                            </td>
                            {/* <td>
                                <button className="btn-danger btn" onClick={() => handleDelete(concert.concert_id, formattedDate)}>Delete</button>
                            </td> */}
                        </tr>
                    )}

                </tbody>
            </table>
        }

        {addRow && (
            <div className="admin-controls">
                <button className="btn" onClick={handleSubmit}>Submit</button>
                <button className="btn-outline" onClick={handleCancel}>Cancel</button>
            </div>
        )}
    </div>
)
}