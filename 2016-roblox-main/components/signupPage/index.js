import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import axios from "axios";
import useButtonStyles from "../../styles/buttonStyles";
import ActionButton from "../actionButton";

const useStyles = createUseStyles({
    header: {
        fontSize: '30px',
        textAlign: 'center',
        marginBottom: '30px',
    },
    subHeader: {
        fontSize: '18px',
        textAlign: 'center',
        marginBottom: '12px',
    },
    hint: {
        fontSize: '13px',
        color: '#555',
        textAlign: 'center',
        marginBottom: '14px',
    },
    card: {
        boxShadow: '0 2px 6px rgb(0 0 0 / 18%)',
        borderRadius: '3px',
        background: '#fff',
        padding: '24px',
        maxWidth: '480px',
        margin: '0 auto',
    },
    discordButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        borderRadius: '3px',
        background: '#5865F2',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        '&:hover': {
            background: '#4752C4',
        },
        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
    discordLogo: {
        width: '22px',
        height: '22px',
        fill: '#fff',
    },
    linkedCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        background: '#F5F7FB',
        border: '1px solid #DDE1EA',
        borderRadius: '3px',
        marginBottom: '18px',
    },
    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: '#5865F2',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 700,
    },
    discordName: {
        fontSize: '15px',
        fontWeight: 600,
    },
    linkedLabel: {
        fontSize: '12px',
        color: '#5865F2',
        fontWeight: 600,
    },
    inputLabel: {
        color: '#343434',
        marginBottom: '4px',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        marginBottom: '12px',
    },
    birthdaySelects: {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        '& select': {
            width: '33.333%',
        },
    },
    radioRow: {
        display: 'flex',
        gap: '24px',
        marginBottom: '12px',
        '& label': {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '15px',
            cursor: 'pointer',
        },
    },
    error: {
        color: '#c00',
        marginBottom: '14px',
        textAlign: 'center',
    },
    finePrint: {
        fontSize: '12px',
        color: '#777',
        marginTop: '16px',
        textAlign: 'center',
    },
});

const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getDiscordProfile = () => {
    if (typeof window === "undefined") return null;
    const match = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("discord_profile="));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match.slice("discord_profile=".length)));
    } catch {
        return null;
    }
};

const SignUp = () => {
    const buttonStyles = useButtonStyles();
    const s = useStyles();
    const [profile, setProfile] = useState(() => getDiscordProfile());
    const [locked, setLocked] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const err = params.get('err');
        const signupmsg = params.get('signupmsg');
        if (err) {
            setFeedback(decodeURIComponent(err));
        } else if (signupmsg) {
            setFeedback(decodeURIComponent(signupmsg));
        }
    }, []);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [year, setYear] = useState("");
    const [gender, setGender] = useState("");

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        const list = [];
        for (let y = current - 13; y >= 1900; y--) {
            list.push(y);
        }
        return list;
    }, []);

    const errorFromResponse = (e) => {
        const data = e.response?.data;
        if (data?.message) return data.message;
        const reason = data?.reasons?.[0];
        const reasonMessages = {
            "AbuseDetection-1": "This Discord account is already linked to another BubbaBlox account. Each Discord account can only be used once.",
            "AbuseDetection-2": "Discord verification is missing. Please link your Discord account first.",
            "AbuseDetection-3": "Your Discord verification has expired or was already used. Please link your Discord account again.",
            "UsernameTaken": "Username is already taken.",
            "InvalidUsername": "Invalid username.",
            "PasswordRequired": "Password is required.",
            "InvalidPassword": "Invalid password.",
            "BirthdayRequired": "Birthday is required.",
            "GenderRequired": "Gender is required.",
            "InvalidGender": "Invalid gender selection.",
            "Cooldown": "Too many attempts. Please try again in a few minutes.",
        };
        return reasonMessages[reason] || "Sign up failed. Please try again.";
    };

    const linkDiscord = () => {
        window.location.href = "/discordverify";
    };

    const submitSignup = async (body) => {
        let csrf = "";
        let retries = 0;
        while (true) {
            if (retries >= 3) {
                throw new Error("CSRF failure after max retries - are cookies enabled?");
            }
            try {
                return await axios.post("/login/signup", body, {
                    headers: {
                        "x-csrf-token": csrf,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    validateStatus: status => status >= 200 && status < 400,
                    maxRedirects: 0,
                });
            } catch (e) {
                const result = e.response;
                if (result && result.status === 403 && result.headers["x-csrf-token"]) {
                    csrf = result.headers["x-csrf-token"];
                    retries++;
                    continue;
                }
                throw e;
            }
        }
    };

    const onSignUpClick = e => {
        e.preventDefault();
        setFeedback(null);

        if (!month || !day || !year) {
            setFeedback("Birthday is required.");
            return;
        }
        if (!gender) {
            setFeedback("Gender is required.");
            return;
        }
        if (!username.trim()) {
            setFeedback("Username is required.");
            return;
        }
        if (!password) {
            setFeedback("Password is required.");
            return;
        }

        const body = new URLSearchParams({
            username: username.trim(),
            password,
            birthday: `${month}/${day}/${year}`,
            gender: gender,
            context: "Signup",
        }).toString();

        setLocked(true);
        submitSignup(body).then(res => {
            if (res.status >= 300 && res.status < 400) {
                window.location.href = "/home";
            } else {
                window.location.href = "/home";
            }
        }).catch(err => {
            setFeedback(errorFromResponse(err));
            setLocked(false);
        });
    };

    return <div className="container">
        <div className="row">
            <div className="col-12 col-lg-8 offset-lg-2">
                <div className="mt-4 mb-4">
                    <h1 className={s.header}>Sign Up to Build & Make Friends</h1>
                </div>
                {feedback && <p className="text-danger mb-3" style={{ textAlign: "center" }}>{feedback}</p>}
                <div className={s.card}>
                    <p className={s.hint}>A linked Discord account is required to sign up. Each Discord account can only be used once.</p>
                    {!profile ? <div>
                        <p className={s.subHeader}>Link your Discord account</p>
                        <button disabled={locked} className={s.discordButton} onClick={linkDiscord}>
                            <svg className={s.discordLogo} viewBox="0 0 127.14 96.36">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                            </svg>
                            Continue with Discord
                        </button>
                        <p className={s.hint} style={{ marginTop: "14px" }}>
                            After authorizing, you will be redirected back here to finish signing up.
                        </p>
                    </div> : <div>
                        <div className={s.linkedCard}>
                            <div className={s.avatar}>{profile.username ? profile.username.charAt(0).toUpperCase() : "?"}</div>
                            <div>
                                <div className={s.linkedLabel}>Discord Linked</div>
                                <div className={s.discordName}>{profile.username}{profile.discriminator && profile.discriminator !== "0" ? `#${profile.discriminator}` : ""}</div>
                            </div>
                        </div>
                        <form onSubmit={onSignUpClick}>
                            <div>
                                <label className={s.inputLabel}>Username</label>
                                <input disabled={locked} type="text" className={`form-control ${s.input}`} value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <label className={s.inputLabel}>Password</label>
                                <input disabled={locked} type="password" className={`form-control ${s.input}`} value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className={s.inputLabel}>Birthday</label>
                                <div className={s.birthdaySelects}>
                                    <select disabled={locked} className="form-control" value={month} onChange={e => setMonth(e.target.value)}>
                                        <option value="">Month</option>
                                        {Months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                    </select>
                                    <select disabled={locked} className="form-control" value={day} onChange={e => setDay(e.target.value)}>
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select disabled={locked} className="form-control" value={year} onChange={e => setYear(e.target.value)}>
                                        <option value="">Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={s.inputLabel}>Gender</label>
                                <div className={s.radioRow}>
                                    <label>
                                        <input disabled={locked} type="radio" name="gender" value="2" checked={gender === "2"} onChange={e => setGender(e.target.value)} />
                                        Male
                                    </label>
                                    <label>
                                        <input disabled={locked} type="radio" name="gender" value="3" checked={gender === "3"} onChange={e => setGender(e.target.value)} />
                                        Female
                                    </label>
                                </div>
                            </div>
                            <ActionButton disabled={locked} label='Sign Up' className={buttonStyles.continueButton} onClick={onSignUpClick}></ActionButton>
                        </form>
                        <p className={s.finePrint}>By signing up you agree to the holding of your name, password, email, and other identifiable information.</p>
                    </div>}
                </div>
            </div>
        </div>
    </div>
}

export default SignUp;