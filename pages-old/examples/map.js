const CodePage = () => {


    return (

        <div
            style={{
                width: '100vw',
                height: '100vh',
                //background: '#1c1f29',
                overflow: 'hidden',
                position: 'relative',

            }}
            className="game-bg"
        >

            <div className="react-wrapper">
                <div className="gameFieldWrapper">
                    <div
                        id="gameBox"
                        className={`ui-widget-content`}
                        
                    >
                    </div>
                    <div className="position_bottom_left po panel add map-wrap">

                        <svg
                            viewBox="1081 439 3633.976375 1379.984375"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ width: "352.835px" }}

                        >

                            <g
                                filter="url(#blurMe)"
                                x="1081"
                                y="439"
                                width="2552"
                                height="930"
                            >
                                <rect
                                    x="3820.984375"
                                    y="1519.984375"
                                    width="433.99199999999996"
                                    fill="#489BC1"
                                    height={175}
                                    rx="60"
                                />
                                <rect
                                    x="3745.9930725097656"
                                    y="1113.99658203125"
                                    width={306}
                                    fill="#489BC1"
                                    height={260}
                                    rx="60"
                                />
                            </g>

                            

                            <rect
                                x={2622}
                                y={800}
                                width={1536}
                                height={414}
                                fill="transparent"
                                className="map-focus"
                                rx={60}
                                ry={60}
                                stroke="#FFFFFF"
                                strokeWidth={20}
                            />

                            
                            <rect
                                x="3745.9930725097656"
                                y="1113.99658203125"
                                width={306}
                                fill="#489BC1"
                                height={260}
                                clip-path="url(#viewPort)"
                                rx="60"

                            />


                            <filter id="blurMe">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                            </filter>

                            <defs>
                                <clipPath
                                    id="viewPort"
                                >
                                    <rect
                                        x={2622}
                                        y={800}
                                        width={1536}
                                        height={414}                                  
                                    />
                                </clipPath>
                            </defs>

                        </svg>

                        <div className="percent-map-wrap">

                            <svg
                                width={18}
                                height={18}
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="map-minus"
                            >
                                <path
                                    d="M2.25 7.875H15.75C16.371 7.875 16.875 8.379 16.875 9C16.875 9.621 16.371 10.125 15.75 10.125H2.25C1.629 10.125 1.125 9.621 1.125 9C1.125 8.379 1.629 7.875 2.25 7.875Z"
                                    fill="#8097A1"
                                />
                            </svg>

                            <div className="map-percent-value">10%</div>

                            <svg
                                width={18}
                                height={18}
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="map-plus"
                            >
                                <path
                                    d="M15.75 7.875H10.125V2.25C10.125 1.629 9.621 1.125 9 1.125C8.379 1.125 7.875 1.629 7.875 2.25V7.875H2.25C1.629 7.875 1.125 8.379 1.125 9C1.125 9.621 1.629 10.125 2.25 10.125H7.875V15.75C7.875 16.371 8.379 16.875 9 16.875C9.621 16.875 10.125 16.371 10.125 15.75V10.125H15.75C16.371 10.125 16.875 9.621 16.875 9C16.875 8.379 16.371 7.875 15.75 7.875Z"
                                    fill="#8097A1"
                                />
                            </svg>

                        </div>

                        <div className="map-icon">
                            <svg
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M15 4L9 7M9 20L3.55279 17.2764C3.214 17.107 3 16.7607 3 16.382V5.61803C3 4.87465 3.78231 4.39116 4.44721 4.72361L9 7V20ZM9 20L15 17L9 20ZM9 20V7V20ZM15 17L19.5528 19.2764C20.2177 19.6088 21 19.1253 21 18.382V7.61803C21 7.23926 20.786 6.893 20.4472 6.72361L15 4V17ZM15 17V4V17Z"
                                    stroke="white"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                    </div>

                </div>
            </div>


        </div>


        
        );
};

export default CodePage;
