const AdminLogDetails = ({ log }) => {
  return <pre>{JSON.stringify(log, null, 2)}</pre>;
};

export default AdminLogDetails;
