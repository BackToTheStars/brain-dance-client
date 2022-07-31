import turn from "./turn.json"

const LastTurns = () => {

    return (
        <div>
            {
                turn.filter(turn => turn.contentType !== "text").map(turn => {
                    return (
                        
                            <div className="sticky-top top-4" key={turn._id}>
                            <br></br>

                            <div className="card">
                                <img
                                    className="card-img-top d-none d-sm-block"
                                    src={(() => {
                                        switch (turn.contentType) {
                                          case "picture":   return turn.imageUrl;
                                          case "video": return turn.videoUrl;
                                          default:      return ""; 
                                        }
                                      })()}                                 
                                    alt="Game image"
                                />
                                <div className="card-body">
                                    <h5 className="card-title">                  
                                      {turn.header}
                                    </h5>
                                    <div className="card-game-buttons">
                                        <a className="btn btn-success me-2 mb-2" href="/game?hash=136">
                                            Open
                                        </a>                                    
                                    </div>
                                </div>
                            </div>
                            
                            <br></br>


                            </div>

                        )

                })
            }
        </div>
    )

}

export default LastTurns