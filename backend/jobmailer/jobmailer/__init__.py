# Python 3.14+ compatibility patch for Django Context copying in tests
import sys

if sys.version_info >= (3, 14):
    try:
        from django.template import context

        def _patched_base_context_copy(self):
            cls = self.__class__
            duplicate = cls.__new__(cls)
            duplicate.__dict__.update(self.__dict__)
            duplicate.dicts = self.dicts[:]
            return duplicate

        context.BaseContext.__copy__ = _patched_base_context_copy
    except ImportError:
        pass
