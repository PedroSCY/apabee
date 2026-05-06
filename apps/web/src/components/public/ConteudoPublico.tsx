import React from 'react'

function ConteudoPublico({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 ${className ? className : ''} `}>
      {children}
    </div>
  )
}

export default ConteudoPublico
