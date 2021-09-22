import { ROLES } from '../config';

const AccessCodesTable = ({ codes = [] }) => {
  return (
    // <table className="table table-striped table-dark mb-0">
    <table className="table table-striped mb-0">

      <thead>
        <tr className="th-no-borders">

          <th>Role</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code) => {
          return (
            <tr key={code.hash}>
              <td>{ROLES[code.role].name}</td>
              <td>{code.hash}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AccessCodesTable;
