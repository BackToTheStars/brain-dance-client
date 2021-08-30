const Telemetry = (props) => {
  return (
    <div className="telemetry">
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};

export default Telemetry;
