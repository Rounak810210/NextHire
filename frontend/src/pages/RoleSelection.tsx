import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description: 'Practice technical and behavioral questions for software engineering positions.',
    icon: '💻',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Prepare for product sense and execution questions.',
    icon: '📱',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Practice data analysis and machine learning concepts.',
    icon: '📊',
    color: 'from-green-500/20 to-teal-500/20',
  },
  {
    id: 'ux-designer',
    title: 'UX Designer',
    description: 'Prepare for design challenges and portfolio reviews.',
    icon: '🎨',
    color: 'from-orange-500/20 to-yellow-500/20',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate(`/practice/${roleId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="page-container"
    >
      <div className="content-container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="heading-1 mb-4"
          >
            Choose Your Role
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body max-w-2xl mx-auto"
          >
            Select the role you're preparing for, and we'll customize your interview practice experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(role.id)}
              className={`feature-card cursor-pointer bg-gradient-to-br ${role.color} backdrop-blur-sm hover:shadow-lg transition-all duration-200`}
            >
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {role.title}
              </h3>
              <p className="text-body">{role.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RoleSelection; 