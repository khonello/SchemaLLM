import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import interact from 'interactjs';
import { UpwardArrowIcon, StarIcon, BreadCrumbIcon, CloseLineIcon } from "../assets/svg";

export const Base = () => {

    const { '*': params } = useParams()

    const schemaContainerRef = useRef(null)
    const title: any = useRef(null)

    const [entities, setEntities] = useState(
        [
            {
                id: 'users',
                title: 'Users',
                position: { x: 0, y: 0 },
                fields: [
                    { name: 'id', type: 'int' },
                    { name: 'name', type: 'varchar' },
                    { name: 'email', type: 'varchar' },
                    { name: 'password', type: 'varchar' },
                    { name: 'phone', type: 'varchar' }
                ]
            },
            {
                id: 'roles',
                title: 'Roles',
                position: { x: 250, y: 0 },
                fields: [
                    { name: 'id', type: 'int' },
                    { name: 'role_name', type: 'varchar' }
                ]
            },
            {
                id: 'login_history',
                title: 'Login History',
                position: { x: 500, y: 0 },
                fields: [
                    { name: 'id', type: 'int' },
                    { name: 'user_id', type: 'int' },
                    { name: 'login_time', type: 'Timestamp' },
                    { name: 'ip_address', type: 'varchar' }
                ]
            },
            {
                id: 'permissions_table',
                title: 'Permissions Table',
                position: { x: 750, y: 0 },
                fields: [
                    { name: 'id', type: 'int' },
                    { name: 'role_id', type: 'int' },
                    { name: 'permission_name', type: 'varchar' },
                    { name: 'permission_id', type: 'int' }
                ]
            }
        ]
    )

    const [details, setDetails] = useState(false)
    const [currentProject, setCurrentProject] = useState<any>(null)
    const [messages, setMessages] = useState([
        {
        sender: 'ai',
        text: 'Now you can control what each role can do. That\'s everything! Sound good?'
        },
        {
        sender: 'user',
        text: 'Okay, cool. That works.'
        }
    ])
    const [projects, setProjects] = useState([
        {
            id: 'project1',
            title: 'Database Schema for User Roles',
            description: 'Description 1'
        },
        {
            id: 'project2',
            title: 'Employee Management Database',
            description: 'Description 2'
        },
        {
            id: 'project3',
            title: 'Permissions & Access Control Schema',
            description: 'Description 3'
        },
        {
            id: 'project4',
            title: 'Customer Orders & Payment Schema',
            description: 'Description 4'
        },
        {
            id: 'project5',
            title: 'Product & Cart Schema',
            description: 'Description 5'
        }
    ])

    // const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const text = event.target.value;
    //     setMessages((prevMessages) => [
    //         ...prevMessages,
    //         { sender: 'user', text }
    //     ]);
    //     event.target.value = '';
    // }

    const Title = ( { title }: { title: string } ) => {
        return (
            <div className="flex items-center">
                <h1 className="m-0 text-lg font-medium">{title}</h1>
            </div>
        )
    }

    const navbarHandler = ( destination: string ) => {
        window.location.pathname = destination
    }

    useEffect(() => {
        params === "details" ? (
            setDetails(true)
        ) : (
            setDetails(false)
        )
    }, [params])

    useEffect(() => {
        if (!schemaContainerRef.current) return;

        const entityElements = (schemaContainerRef.current as HTMLElement).querySelectorAll(".entity-container");
        entityElements.forEach((element) => {
            
            if (element.getAttribute("data-x")) element.setAttribute("data-x", "0");
            if (element.getAttribute("data-y")) element.setAttribute("data-y", "0");

            // **Draggable**
            interact(element as HTMLElement).draggable({
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
                        console.log("Drag started:", event.target);
                        event.target.classList.add("dragging");
                    },
                    move: (event: any) => {
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
                        console.log("Drag ended:", event.target);
                        event.target.classList.remove("dragging");

                        const entityId = event.target.getAttribute("data-id");
                        if (!entityId) return;

                        setEntities((prevEntities: any) =>
                            prevEntities.map((entity: any) =>
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

            // **Resizable**
            interact(element as HTMLElement).resizable({
                edges: { left: true, right: true, top: true, bottom: true },
                listeners: {
                    start: (event) => {
                        console.log("Resize started:", event.target);
                    },
                    move: (event) => {
                        let { width, height } = event.rect;
                        event.target.style.width = `${width}px`;
                        event.target.style.height = `${height}px`;
                    },
                    end: (event) => {
                        console.log("Resize ended:", event.target);
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
            entityElements.forEach((element) => interact(element as HTMLElement).unset());
        };
    }, [entities])

    useEffect(() => {
        
        currentProject !== null && (
            navbarHandler(currentProject)
        )
    }, [currentProject])

    return (
        <div className="flex flex-col h-screen font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-1"><StarIcon size={15} color="white" /> KeyMap</div>
                    </div>
                </div>
                <Title title= {title.current}/>
                <div className="flex items-center gap-4">
                    <button className="bg-transparent border-0 text-xl cursor-pointer" onClick={(ev) => 
                        {
                            !details ? (
                                    navbarHandler("details")
                            ) : (
                                currentProject !== null ? (
                                    navbarHandler(currentProject)
                                ) : (
                                    navbarHandler("/")
                                )
                            )
                        }
                    }>
                        {
                            !details ? (
                                <BreadCrumbIcon size={15} color="white" />
                            ) : (
                                <CloseLineIcon size={15} color="white" />
                            )
                        }
                    </button>
                    <div className="w-8 h-8 overflow-hidden rounded-full">
                        <img src="/assets/Avatar.png" alt="User" className="w-full h-full object-cover" />  // not working
                    </div>
                </div>
            </header>

            {params?.length === 0 ? (
                <div className="flex flex-col flex-1">
                    <div className="flex-1 p-5 bg-transparent relative overflow-auto m-2 rounded">
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="m-0 text-lg font-regular">Welcome, <i>User.</i></div>
                            <div className="m-0 text-lg text-gray-400 font-regular -mt-2">What are we building today?</div>
                        </div>
                    </div>
                    {/* <div className="p-4 bg-transparent mx-2 mb-2 rounded max-h-40 overflow-y-auto"></div> */}
                </div>
            ) : (
                !details ? (
                    <>
                        <div ref={schemaContainerRef} className="flex-1 p-5 bg-transparent relative overflow-auto m-2 rounded">
                            {entities.map((entity: any) => (
                                <div key={entity.id} className="entity-container absolute w-56 bg-white border border-gray-200 shadow-sm touch-none select-none" data-id={entity.id} style={{ transform: `translate(${entity.position.x}px, ${entity.position.y}px)` }}>
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-bold">
                                        {entity.title}
                                    </div>
                                    <div className="py-1">
                                        {entity.fields.map((field: any, index: any) => (
                                            <div key={index} className="flex justify-between px-3 py-1 border-b border-gray-100 last:border-0">
                                                <div className="text-sm">{field.name}</div>
                                                <div className="text-sm text-gray-500">{field.type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-transparent mx-2 mb-2 rounded max-h-40 overflow-y-auto">
                            {messages.map((message: any, index) => (
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
                                        projects.map(({id, title, description} : {id: any, title: any, description: any}) => {
                                            if (id === currentProject) {
                                                return (
                                                    <button key={id} className="m-0 text-sm text-blue-600 font-small mb-6" onClick={(ev) => {
                                                        setCurrentProject(id)
                                                        // navbarHandler(id)
                                                    }}>{title}</button>
                                                )
                                            } else {
                                                return (
                                                    <button key={id} className="m-0 text-sm text-gray-800 font-small mb-6" onClick={(ev) => {
                                                        setCurrentProject(id)
                                                        // navbarHandler(id)
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
        

            {/* Input Container */}
            {
                !details ? (
                    <div className="flex items-center justify-center">
                        <div className="flex items-center border border-gray-200 mx-2 mb-8 rounded-xl w-[60%]">
                            <input type="text" placeholder="Ask anything" className="flex-1 px-5 py-3 rounded-xl text-xs focus:outline-none"/>
                            <button className="bg-black text-white rounded-full w-5 h-5 ml-2 mr-2 flex items-center justify-center cursor-pointer">
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