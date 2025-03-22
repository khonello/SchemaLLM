import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { UpwardArrowIcon, StarIcon, BreadCrumbIcon, CloseLineIcon, EditButtonIcon } from "../assets/svg";
import interact from 'interactjs';
import axios, { Axios } from 'axios';

export const Base = () => {

    const { 'pathname': location } = useLocation()

    const navigate = useNavigate()
    const API_URL = "http://127.0.0.1:8000/api/"

    const schemaContainerRef = useRef<HTMLDivElement | any>(null)
    const tempTitleRef = useRef<string | null>(null)
    const [entities, setEntities] = useState<any[]>(
        []
    )
    const [currentProject, setCurrentProject] = useState<any>(null)
    const [schemaTitle, setSchemaTitle] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [schemaText, setSchemaText] = useState("")
    const [conversationInput, setConversationInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [messages, setMessages] = useState([ { sender: "ai", text: "" }, { sender: "user", text: "" } ])
    const [lastTwoMessages, setLastTwoMessages] = useState<any[]>([])
    const [projects, setProjects] = useState([])

    const toggleEditMode = () => {

        if (isEditing) {
            
            try {

                // const newEntities = JSON.parse(schemaText)
                // setEntities(newEntities)
            } catch (error) {

                // console.error("Invalid JSON:", error)
                // setErrorMessage("Invalid JSON. Please check your syntax.");
                // return // Don't toggle edit mode if JSON is invalid
            }
        }
        setIsEditing(!isEditing);
    }

    const navbarHandler = ( destination: string ) => {
        
        if (destination !== "/" && destination !== "/details") {

            const projectURL = `${API_URL}project${destination}`
            getSchema(null, projectURL)
            navigate(destination)
        } else if (destination === "/details") {
            
            (async () => {
                
                const response = await axios.get(`${API_URL}details`, {})
                setProjects(response.data)
            })()
            navigate(destination)
        } else {

            setCurrentProject(null)
            navigate("/")
        }
    }

    const getSchema = async (title: string | null = null, projectURL: string | null = null, conversation: string | null = null) => {
        
        const execSchema = (resp: any) => {

            const newEntities = resp.data.json.map((entity: any, index: number) => ({

                id: entity.id, 
                fields: entity.fields, 
                title: entity.title, 
                position: {x: index * 250, y: 0}
            }))
            tempTitleRef.current = title
            setSchemaTitle(resp.data.title)
            setEntities(newEntities)
            setSchemaText(resp.data.sql)
            
            // Process message data all at once instead of incrementally
            const newMessages: { sender: string; text: any; }[] = []
            resp.data.conversations.chat.forEach((message: any) => {

                newMessages.push({ sender: 'user', text: message.user })
                newMessages.push({ sender: 'ai', text: message.ai })
            })
            setMessages(newMessages.reverse())
        }

        try {

            if (projectURL && conversation) {
                
                const response = await axios.post(projectURL, { conversation: conversation })
                execSchema(response)
            } else if (!projectURL) {

                const response = await axios.get(API_URL, { params: { title: title } })
                execSchema(response)
            } else {

                const response = await axios.get(projectURL, { })
                execSchema(response)
            }
            
        } catch (error) {

            console.error("Error fetching schema:", error)
            setErrorMessage("Failed to fetch schema data. Please try again.")
        }
    }

    const handleConversationClick = async () => {
        
        setErrorMessage("")
        setIsLoading(true)
        
        try {
            
            if (!currentProject) {

                setMessages([])
                setEntities([])
                
                if (!conversationInput.trim()) {
                    throw new Error("Please enter a message")
                }
                
                const response = await axios.post(API_URL, { 
                    title: null, 
                    conversation: conversationInput 
                })
                
                if (!response.data || !response.data.title) {
                    throw new Error("Invalid response from server")
                }
                
                const newTitle = response.data.title
                setSchemaTitle(newTitle)
                setConversationInput('')
                
                tempTitleRef.current = newTitle
                navbarHandler(`/${newTitle}`)
                
                await getSchema(newTitle)
            } else {

                const projectURL = `${API_URL}project/${currentProject}`
                getSchema(null, projectURL, conversationInput)
                setConversationInput('')

            }
        } catch (error: any) {
            
            console.error("Error in conversation:", error)
            setErrorMessage(
                error.response?.data?.message || 
                error.message || 
                "Failed to process your request. Please try again."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const Title = ({ title } : {title: any}) => {
        return (
            <div className="flex items-center">
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setSchemaTitle(e.target.value)}
                        className="m-0 text-lg font-medium border-b border-gray-300 focus:outline-none"
                    />
                ) : (
                    <h1 className="m-0 text-lg font-medium">{title}</h1>
                )}
            </div>
        );
    }

    const LastTwoMessage = ( {lastTwo} : {lastTwo : any[]}) => (
        <div className="p-4 bg-transparent mx-2 mb-2 rounded max-h-40 overflow-y-auto">
            {
                !isEditing && lastTwo.map((message, index) => (
                    <div key={index} className="p-2 max-w-[100%] mx-auto text-center">
                                {message.sender === 'user' ? (
                                    <div className="mx-auto text-center bg-gray-100 py-2 px-4 inline-block rounded-xl shadow-sm">
                                        {message.text}
                                    </div>
                                ) : (
                                    <div className="mx-auto text-center">
                                        <div className="bg-transparent text-gray-800 py-2 px-4 inline-block">
                                            {message.text}
                                        </div>
                                    </div>
                                )
                            }
                    </div>
            ))}
        </div>
    )

    useEffect(() => {
        
        // const entitiesJson = JSON.stringify(entities, null, 2);
        // setSchemaText('')
    }, [entities])

    useEffect(() => {
        if (!schemaContainerRef.current || isEditing) return;

        const entityElements = (schemaContainerRef.current).querySelectorAll(".entity-container")
        entityElements.forEach((element: HTMLElement) => {
            
            if (element.getAttribute("data-x")) element.setAttribute("data-x", "0");
            if (element.getAttribute("data-y")) element.setAttribute("data-y", "0");

            interact(element).draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: "parent",
                        endOnly: true,
                    }),
                ],
                autoScroll: true,
                listeners: {
                    start: (event) => {
                        
                        event.target.classList.add("dragging");
                    },
                    move: (event) => {
                        const target = event.target;

                        let x = parseFloat(target.getAttribute("data-x")) || 0;
                        let y = parseFloat(target.getAttribute("data-y")) || 0;

                        x += event.dx;
                        y += event.dy;

                        target.style.transform = `translate(${x}px, ${y}px)`;

                        target.setAttribute("data-x", String(x))
                        target.setAttribute("data-y", String(y))
                    },
                    end: (event) => {
                        event.target.classList.remove("dragging");

                        const entityId = event.target.getAttribute("data-id");
                        if (!entityId) return;

                        setEntities((prevEntities) =>
                            prevEntities.map((entity) =>
                                entity.id === entityId
                                    ? {
                                        ...entity,
                                        position: {
                                            x: parseFloat(event.target.getAttribute("data-x")) || 0,
                                            y: parseFloat(event.target.getAttribute("data-y")) || 0,
                                        },
                                    }
                                    : entity
                            )
                        );
                    },
                },
            })

            interact(element).resizable({
                edges: { left: true, right: true, top: true, bottom: true },
                listeners: {
                    start: (event) => {
                        event.target.classList.add("resizing");
                    },
                    move: (event) => {
                        let { width, height } = event.rect;
                        event.target.style.width = `${width}px`;
                        event.target.style.height = `${height}px`;
                    },
                    end: (event) => {
                        event.target.classList.remove("resizing");
                    },
                },
                modifiers: [
                    interact.modifiers.restrictSize({
                        min: { width: 50, height: 50 },
                        max: { width: 500, height: 500 },
                    }),
                ],
            })
        })

        return () => {
            entityElements.forEach((element: any) => interact(element).unset());
        };
    }, [entities, isEditing])

    useEffect(() => {
        currentProject !== null && (
            navbarHandler(`/${currentProject}`)
        )
    }, [currentProject])

    useEffect(() => {

        setLastTwoMessages(
            messages.length > 2 ? (
                messages.slice(0, 2)
            ) : (
                messages
            )
        )
    }, [messages])

    return (
        <div className="flex flex-col h-screen font-sans">
            
            <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-1"><StarIcon size={15} color="white" /> KeyMap</div>
                    </div>
                </div>
                <Title title={schemaTitle} />
                <div className="flex items-center gap-4">
                    {location !== "/" && location !== "/details" && (
                        <button 
                            className="bg-transparent border-0 text-xl cursor-pointer flex items-center justify-center" 
                            onClick={toggleEditMode}
                            title={isEditing ? "Save changes" : "Edit schema"}
                        >
                            {isEditing ? (
                                <span className="text-xs">Save</span>
                            ) : (
                                <EditButtonIcon />
                            )}
                        </button>
                    )}
                    <button className="bg-transparent border-0 text-xl cursor-pointer" onClick={(ev) => 
                        {
                            location === "/" || location !== "/details" ? (
                                    navbarHandler("/details")
                            ) : (
                                currentProject !== null ? (
                                    navbarHandler(`/${currentProject}`)
                                ) : (
                                    navbarHandler("/")
                                )
                            )
                        }
                    }>
                        {
                            location === "/" || location !== "/details" ? (
                                <BreadCrumbIcon size={15} color="white" />
                            ) : (
                                <CloseLineIcon size={15} color="white" />
                            )
                        }
                    </button>
                    <div className="w-8 h-8 overflow-hidden rounded-full">
                        <img src="/assets/Avatar.png" alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {location === "/" ? (
                <div className="flex flex-col flex-1">
                    <div className="flex-1 p-5 bg-transparent relative overflow-auto m-2 rounded">
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="m-0 text-lg font-regular">Welcome, <i>User.</i></div>
                            <div className="m-0 text-lg text-gray-400 font-regular -mt-2">What are we building today?</div>
                        </div>
                    </div>
                </div>
            ) : (
                location === "/" || location !== "/details" ? (
                    <>
                        <div ref={schemaContainerRef} className="flex-1 p-5 relative overflow-auto m-2 rounded">
                            {isEditing ? (
                                <div className="flex flex-col h-full">
                                    <textarea
                                        value={schemaText}
                                        onChange={(e) => setSchemaText(e.target.value)}
                                        className="flex-1 p-4 border border-gray-200 rounded font-mono text-sm"
                                        placeholder="Edit your schema in SQL format"
                                        rows={100}
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button
                                            className="bg-gray-200 text-gray-800 rounded-md px-3 py-2 text-sm mr-2"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="bg-black text-white rounded-md px-3 py-2 text-sm"
                                            onClick={toggleEditMode}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                entities.map((entity) => (
                                    <div key={entity.id} className="entity-container absolute w-56 bg-white border border-gray-200 shadow-sm touch-none select-none" data-id={entity.id} style={{ transform: `translate(${entity.position.x}px, ${entity.position.y}px)` }}>
                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-bold">
                                            {entity.title}
                                        </div>
                                        <div className="py-1">
                                            {entity.fields.map((field: any, index: number) => (
                                                <div key={index} className="flex justify-between px-3 py-1 border-b border-gray-100 last:border-0">
                                                    <div className="text-sm">{field.name}</div>
                                                    <div className="text-sm text-gray-500">{field.type}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-transparent mx-2 mb-2 rounded max-h-40 overflow-y-auto">
                            {
                                !isEditing && lastTwoMessages.map((message, index) => (
                                    <div key={index} className="p-2 max-w-[100%] mx-auto text-center">
                                                {message.sender === 'user' ? (
                                                    <div className="mx-auto text-center bg-gray-100 py-2 px-4 inline-block rounded-xl shadow-sm">
                                                        {message.text}
                                                    </div>
                                                ) : (
                                                    <div className="mx-auto text-center">
                                                        <div className="bg-transparent text-gray-800 py-2 px-4 inline-block">
                                                            {message.text}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                    </div>
                            ))}
                        </div>
                    </>
                        
                    ) : (
                        <div className="flex flex-col flex-1">
                            <div className="flex-1 p-1 bg-transparent relative overflow-auto m-2 rounded">
                                <div className="flex flex-col items-center justify-center h-full">
                                    {
                                        projects.map(({title} : {title: string}, key: number) => {
                                            if (title === currentProject) {
                                                return (
                                                    <button key={key} className="m-0 text-sm text-blue-600 font-small mb-6" onClick={(ev) => {
                                                        setCurrentProject(title)
                                                    }}>{title}</button>
                                                )
                                            } else {
                                                return (
                                                    <button key={key} className="m-0 text-sm text-gray-800 font-small mb-6" onClick={(ev) => {
                                                        setCurrentProject(title)
                                                    }}>{title}</button>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    )
                )
            }

            {/* Error message display */}
            {errorMessage && (
                <div className="text-center text-sm text-red-500 mb-2">{errorMessage}</div>
            )}

            {/* Input Container */}
            {
                location === "/" || location !== "/details" ? (
                    <div className="flex flex-col items-center justify-center">
                        {isLoading && (
                            <div className="text-center text-sm text-gray-500 mb-2">Processing...</div>
                        )}
                        <div className="flex items-center border border-gray-200 mx-2 mb-8 rounded-xl w-[60%]">
                            <input 
                                type="text" 
                                placeholder="Ask anything" 
                                className="flex-1 px-5 py-3 rounded-xl text-xs focus:outline-none" 
                                onChange={(e) => setConversationInput(e.target.value)} 
                                value={conversationInput}
                                disabled={isLoading}
                            />
                            <button 
                                className={`bg-black text-white rounded-full w-5 h-5 ml-2 mr-2 flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
                                onClick={handleConversationClick}
                                disabled={isLoading}
                            >
                                <UpwardArrowIcon size={12} color="white" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <button className="flex items-center justify-center border border-gray-200 mx-2 mb-8 rounded-full w-[20%] h-8 bg-black text-white" onClick={(ev) => {
                            navbarHandler("/")
                        }}>
                            <span className="text-lg pr-1 mb-0.5">+</span>
                            <span className="text-xs mb-0.5">New Project</span>
                        </button>
                    </div>
                )
            }
        </div>
    )
}