import { ROLES } from '../config';

const AccessCodesTable = ({ codes = [] }) => {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <td>Role</td>
          <td>Code</td>
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
