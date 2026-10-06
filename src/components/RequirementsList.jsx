function RequirementsList({ requirements, language }) {
  if (!requirements?.length) {
    return <p>No requirements found.</p>;
  }

  return (
    <div className="requirements-list">
      {requirements.map((requirement) => (
        <div className="requirement-card" key={requirement.id}>
          <div>
            <strong>
              {language === "bn" ? requirement.title_bn : requirement.title_en}
            </strong>

            <p>Order: {requirement.order}</p>
          </div>

          <div>
            <span>{requirement.mandatory ? "Mandatory" : "Optional"}</span>

            {requirement.has_expiry && <span> • Expiry required</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RequirementsList;
