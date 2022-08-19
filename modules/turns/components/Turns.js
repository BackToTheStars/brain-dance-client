import { useSelector } from "react-redux"
import Turn from "./Turn"

const Turns = () => {
  const turns = useSelector(store => store.turns.turns)
  return (
    <>
      {turns.map((turn) => <Turn key={turn._id} id={turn._id} />)}
    </>
  )
}

export default Turns